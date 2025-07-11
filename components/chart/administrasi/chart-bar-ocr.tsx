"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// --- Type Definitions ---
type SemesterFilter = "Semester 1" | "Semester 2" | "Akumulasi"
type OcrApiData = {
    tahun: string
    semester: "1" | "2"
    kategoriOCR: string
    target: number
    realisasi: number | null
}
type ChartDataPoint = {
    kategoriOCR: string
    Target: number
    Realisasi: number
    Sisa?: number
}

const KATEGORI_OCR_OPTIONS = ["KC", "COP", "KP", "Inovasi"];

const chartConfig: ChartConfig = {
    Realisasi: { label: "Realisasi", color: "var(--chart-2)" },
    Sisa: { label: "Sisa Target", color: "var(--chart-1)" },
}

// --- Main Card Component ---
export function ChartBarOCR({ tahun }: { tahun: string }) {
    const [allDataForYear, setAllDataForYear] = React.useState<OcrApiData[]>([])
    const [loading, setLoading] = React.useState(true)
    const [semester, setSemester] = React.useState<SemesterFilter>("Akumulasi")

    // --- Data Fetching ---
    React.useEffect(() => {
        if (!tahun) return;
        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch(`/api/administrasi?type=ocr&tahun=${tahun}`)
                if (!res.ok) throw new Error("Gagal mengambil data OCR")
                const json = await res.json()
                setAllDataForYear(Array.isArray(json) ? json : [])
            } catch (error) {
                toast.error("Gagal memuat data OCR.")
                console.error("Failed to fetch OCR data:", error)
                setAllDataForYear([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [tahun])

    // --- Data Processing for Chart ---
    const chartData = React.useMemo(() => {
        let dataForSemester = allDataForYear;
        // Filter data berdasarkan semester jika bukan 'Akumulasi'
        if (semester !== "Akumulasi") {
            const semesterNumber = semester === "Semester 1" ? "1" : "2";
            dataForSemester = allDataForYear.filter(item => item.semester === semesterNumber);
        }

        // Buat struktur default dan agregasi data, mirip kode referensi
        const defaultStructure = KATEGORI_OCR_OPTIONS.map(kategori => ({
            kategoriOCR: kategori,
            Target: 0,
            Realisasi: 0,
        }));

        const aggregated = defaultStructure.map(item => {
            const itemsForKategori = dataForSemester.filter(d => d.kategoriOCR === item.kategoriOCR);
            const totalTarget = itemsForKategori.reduce((sum, current) => sum + current.target, 0);
            const totalRealisasi = itemsForKategori.reduce((sum, current) => sum + (current.realisasi || 0), 0);

            return {
                ...item,
                Target: totalTarget,
                Realisasi: totalRealisasi,
                Sisa: Math.max(0, totalTarget - totalRealisasi),
            };
        });
        
        return aggregated;
    }, [allDataForYear, semester])

    const isDataEmpty = chartData.every(d => d.Target === 0 && d.Realisasi === 0);

    // --- Skeleton UI ---
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Optimalisasi Citra Perusahaan (OCR)</CardTitle>
                        <CardDescription>Capaian OCR per Kategori - {semester} {tahun}</CardDescription>
                    </div>
                    <Select value={semester} onValueChange={(val) => setSemester(val as SemesterFilter)}>
                        <SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semester 1">Semester 1</SelectItem>
                            <SelectItem value="Semester 2">Semester 2</SelectItem>
                            <SelectItem value="Akumulasi">Akumulasi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-[400]">
                    {isDataEmpty ? (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            Tidak ada data untuk periode ini.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 60, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="kategoriOCR"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={false}
                                    content={({ payload, label }) => {
                                        const current = chartData.find(d => d.kategoriOCR === label);
                                        if (!current) return null;

                                        const percentage = current.Target > 0 ? (current.Realisasi / current.Target) * 100 : 0;

                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[200px]">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--color-Realisasi)' }} />
                                                        <p className="text-muted-foreground">Realisasi</p>
                                                    </div>
                                                    <p className="font-medium text-right">{current.Realisasi}</p>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--color-Sisa)' }} />
                                                        <p className="text-muted-foreground">Target</p>
                                                    </div>
                                                    <p className="font-medium text-right">{current.Target}</p>
                                                    
                                                    <div className="col-span-2 border-t mt-1 pt-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-muted-foreground">Capaian</p>
                                                            <p className="font-medium text-right">{percentage.toFixed(1)}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
                                <Bar dataKey="Realisasi" stackId="a" fill="#000000" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Sisa" stackId="a" fill="#dedede" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
