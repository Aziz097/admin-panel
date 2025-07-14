"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"

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
    OriginalRealisasi: number
    RealisasiPartial: number
    RealisasiComplete: number
    Sisa?: number
}

const bulanMapping: Record<string, string> = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember",
  };

const KATEGORI_OCR_OPTIONS = ["KC", "COP", "KP", "Inovasi"];

const chartConfig: ChartConfig = {
    Realisasi: { label: "Realisasi", color: "#0ea5e9" },
    Sisa: { label: "Sisa Target", color: "#bae6fd" },
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
        if (semester !== "Akumulasi") {
            const semesterNumber = semester === "Semester 1" ? "1" : "2";
            dataForSemester = allDataForYear.filter(item => item.semester === semesterNumber);
        }

        const aggregated = KATEGORI_OCR_OPTIONS.map(kategori => {
            const itemsForKategori = dataForSemester.filter(item => item.kategoriOCR === kategori);
            const totalTarget = itemsForKategori.reduce((sum, item) => sum + item.target, 0);
            const totalRealisasi = itemsForKategori.reduce((sum, item) => sum + (item.realisasi || 0), 0);
            
            // **DIUBAH**: Logika untuk memecah realisasi berdasarkan status capaian
            const isComplete = totalTarget > 0 && totalRealisasi >= totalTarget;

            return {
                kategoriOCR: kategori,
                Target: totalTarget,
                OriginalRealisasi: totalRealisasi,
                RealisasiPartial: isComplete ? 0 : totalRealisasi,
                RealisasiComplete: isComplete ? totalTarget : 0, // Jika komplit, bar ini yang diisi
                Sisa: isComplete ? 0 : Math.max(0, totalTarget - totalRealisasi),
            };
        });
        
        return aggregated;
    }, [allDataForYear, semester])

    const isDataEmpty = chartData.every(d => d.Target === 0 && d.OriginalRealisasi === 0);

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
                        <CardTitle className="font-bold text-xl">OCR</CardTitle>
                        <CardDescription className="text-md text-zinc-400">{semester} - {tahun}</CardDescription>
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
                <div className="h-[400px] w-[full]">
                    {isDataEmpty ? (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <AlertCircle className="w-4 h-4 me-3" />
                            <span>Belum ada data untuk periode {semester} - {tahun}</span>
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
                                <Tooltip
                                    cursor={false}
                                    content={({ payload, label }) => {
                                        const current = chartData.find(d => d.kategoriOCR === label);
                                        if (!current) return null;

                                        const percentage = current.Target > 0 ? (current.OriginalRealisasi / current.Target) * 100 : 0;

                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[200px]">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: '#bae6fd' }} />
                                                        <p className="text-muted-foreground">Target</p>
                                                    </div>
                                                    <p className="font-medium text-right">{current.Target}</p>

                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
                                                        <p className="text-muted-foreground">Realisasi</p>
                                                    </div>
                                                    <p className="font-medium text-right">{current.OriginalRealisasi}</p>
                                                    
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
                                <Bar dataKey="RealisasiPartial" name="Realisasi" stackId="a" fill="#0ea5e9" barSize={80} />
                                <Bar dataKey="RealisasiComplete" name="Realisasi" stackId="a" fill="#0ea5e9" radius={[8, 8, 0, 0]} barSize={80} />
                                <Bar dataKey="Sisa" name="Sisa" stackId="a" fill="#bae6fd" radius={[8, 8, 0, 0]} barSize={80} />
                            </BarChart>

                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
            <CardFooter className="justify-center gap-6 pt-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#0ea5e9' }} />
                    <span className="leading-none">Realisasi</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#bae6fd' }} />
                    <span className="leading-none">Sisa Target</span>
                </div>
            </CardFooter>
        </Card>
    );
}
