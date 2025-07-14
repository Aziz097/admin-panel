"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

// --- Type Definitions ---
type KepatuhanApiData = {
    id: number;
    tahun: string;
    bulan: string;
    indikator: string;
    kategori: string;
    target: number;
    realisasi: number | null;
    keterangan: string | null;
}

type ChartDataPoint = {
    month: string;
    fullMonth: string;
    Target: number;
    OriginalRealisasi: number;
    RealisasiPartial: number;
    RealisasiComplete: number;
    Sisa: number;
}

// --- Constants ---
const bulanMapping: Record<string, string> = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
};

// FIX: Ensure month keys are always sorted correctly.
const MONTH_KEYS = Object.keys(bulanMapping).sort();

const bulanList = Object.entries(bulanMapping)
    .map(([value, label]) => ({ label, value }))
    .sort((a, b) => parseInt(a.value) - parseInt(b.value));

// --- Helper Functions ---
const getInitialMonth = (tahun: string) => {
    const now = new Date();
    if (tahun === String(now.getFullYear())) {
        return String(now.getMonth() + 1).padStart(2, '0');
    }
    return "01";
};

// --- Main Card Component ---
export function KepatuhanChart({ tahun }: { tahun: string }) {
    const [allDataForYear, setAllDataForYear] = React.useState<KepatuhanApiData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedBulan, setSelectedBulan] = React.useState<string>(() => getInitialMonth(tahun));

    // --- Data Fetching ---
    React.useEffect(() => {
        if (!tahun) return;
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/administrasi?type=kepatuhan&tahun=${tahun}`);
                if (!res.ok) throw new Error("Gagal mengambil data Kepatuhan");
                const json = await res.json();
                setAllDataForYear(Array.isArray(json) ? json : []);
            } catch (error) {
                toast.error("Gagal memuat data Kepatuhan.");
                console.error("Failed to fetch Kepatuhan data:", error);
                setAllDataForYear([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [tahun]);

    // --- Data Processing for Chart ---
    const chartData = React.useMemo<ChartDataPoint[]>(() => {
        // Now MONTH_KEYS is guaranteed to be in order ["01", "02", ..., "12"]
        return MONTH_KEYS.map(monthKey => {
            const itemsForMonth = allDataForYear.filter(item => item.bulan === monthKey);
            const totalTarget = itemsForMonth.reduce((sum, item) => sum + item.target, 0);
            const totalRealisasi = itemsForMonth.reduce((sum, item) => sum + (item.realisasi || 0), 0);
            
            const isComplete = totalTarget > 0 && totalRealisasi >= totalTarget;

            return {
                month: bulanMapping[monthKey].slice(0, 3), // "Jan", "Feb", etc.
                fullMonth: bulanMapping[monthKey],
                Target: totalTarget,
                OriginalRealisasi: totalRealisasi,
                RealisasiPartial: isComplete ? 0 : totalRealisasi,
                RealisasiComplete: isComplete ? totalTarget : 0,
                Sisa: isComplete ? 0 : Math.max(0, totalTarget - totalRealisasi),
            };
        });
    }, [allDataForYear]);

    // --- Data for Table ---
    const tableData = React.useMemo(() => {
        return allDataForYear.filter(item => item.bulan === selectedBulan);
    }, [allDataForYear, selectedBulan]);

    const isDataEmpty = chartData.every(d => d.Target === 0);

    // --- Skeleton UI ---
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-[350px] w-full" />
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                    <div>
                        <CardTitle className="font-bold text-xl text-black">Kepatuhan</CardTitle>
                        <CardDescription className="text-md text-zinc-400">Rekapitulasi Capaian Kepatuhan{tahun}</CardDescription>
                    </div>
                    <Select value={selectedBulan} onValueChange={setSelectedBulan}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {bulanList.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="w-full">
                    <h3 className="font-semibold mb-3">Grafik Capaian Kepatuhan</h3>
                    <div className="h-[300px]">
                        {isDataEmpty ? (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">Belum ada data untuk tahun {tahun}.</div>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        {/* FIX: Add interval={0} to ensure all labels are shown */}
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                                        <Tooltip
                                            cursor={false}
                                            content={({ payload, label }) => {
                                                const current = chartData.find(d => d.month === label);
                                                if (!current || current.Target === 0) return null;
                                                const percentage = (current.OriginalRealisasi / current.Target) * 100;
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[200px]">
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                                            <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: "hsl(198.6 88.7% 48.4%)" }} /><p className="text-muted-foreground">Realisasi</p></div><p className="font-medium text-right">{current.OriginalRealisasi}</p>
                                                            <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: "hsl(200.6 94.4% 86.1%)" }} /><p className="text-muted-foreground">Target</p></div><p className="font-medium text-right">{current.Target}</p>
                                                            <div className="col-span-2 border-t mt-1 pt-1"><div className="flex items-center justify-between"><p className="text-muted-foreground">Capaian</p><p className="font-medium text-right">{percentage.toFixed(1)}%</p></div></div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Bar dataKey="RealisasiPartial" name="Realisasi" stackId="a" fill="var(--color-sky-500)" />
                                        <Bar dataKey="RealisasiComplete" name="Realisasi" stackId="a" fill="var(--color-sky-500)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Sisa" name="Sisa" stackId="a" fill="var(--color-sky-200)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <CardFooter className="justify-center gap-6 pt-4 text-sm text-muted-foreground flex-wrap">
                                    <div className="flex items-center gap-2"><div className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-sky-500)' }} /><span>Realisasi</span></div>
                                    <div className="flex items-center gap-2"><div className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-sky-200)' }} /><span>Target</span></div>
                                </CardFooter>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full">
                    <h3 className="font-semibold mb-3">Rincian Indikator - {bulanMapping[selectedBulan]}</h3>
                    <div className="rounded-lg border max-h-[350px] overflow-y-auto overflow-x-auto">
                        <Table >
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="p-2 pl-4 w-[30%]">Indikator</TableHead>
                                    <TableHead className="p-2 w-[15%]">Eviden</TableHead>
                                    <TableHead className="p-2 w-[15%]">Status</TableHead>
                                    <TableHead className="p-2 w-[40%]">Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Belum ada data untuk periode {bulanMapping[selectedBulan]} - {tahun}.</TableCell></TableRow>
                                ) : (
                                    tableData.map((item) => {
                                        let status = "Selesai";
                                        let Icon = CheckCircle;
                                        let iconColor = "text-green-500";
                                        const realisasi = item.realisasi ?? 0;
                                        const target = item.target;
                                        if (realisasi < target) {
                                            status = "Proses"; 
                                            Icon = Loader2; 
                                            iconColor = "text-yellow-500";
                                        }
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium align-top break-words">{item.indikator}</TableCell>
                                                <TableCell className="align-top">{item.realisasi ?? 0} / {item.target}</TableCell>
                                                <TableCell className="text-center align-top">
                                                    <Badge variant="outline" className={`gap-1.5 ${status === "Selesai"
                                                            ? "border-green-400"
                                                            : status === "Proses"
                                                            ? "border-yellow-400"
                                                            : "border-zinc-300"
                                                            }`}>
                                                        <Icon className={`w-4 h-4 ${iconColor} ${status === "Proses" ? "animate-spin" : ""}`} />
                                                        <span>{status}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{item.keterangan}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
