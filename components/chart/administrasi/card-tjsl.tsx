"use client"

// --- IMPORTS GABUNGAN ---
import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react"


// --- DEFINISI TIPE GABUNGAN ---
type SemesterFilter = "Semester 1" | "Semester 2" | "Akumulasi"

type TjslApiData = {
    id: number
    tahun: string
    semester: "1" | "2"
    status: boolean
    pegawaiId: number
    Pegawai: {
        nama: string
        nip: string
        jabatan: string
    } | null 
}

type ProcessedTableData = {
    nama: string
    nip: string
    s1_status: boolean | null
    s2_status: boolean | null
}

type ChartData = {
    target: number
    realisasi: number
}

interface TjslTableProps {
    loading: boolean
    tableData: ProcessedTableData[]
}

interface ChartRadialTjslProps {
    loading: boolean
    chartData: ChartData
    tahun: string
    semester: SemesterFilter
    setSemester: React.Dispatch<React.SetStateAction<SemesterFilter>>
}

const chartConfig = {
    target: { label: "Target" },
    realisasi: { label: "Realisasi", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig


// --- KOMPONEN LOKAL: StatusBadge (dari table.tsx) ---
const StatusBadge = ({ status }: { status: boolean | null }) => {
    let statusText: string
    let color: string
    let Icon: React.ElementType

    if (status === null) {
        statusText = "Belum Ada Data"
        color = "zinc-400"
        Icon = HelpCircle
    } else if (status) {
        statusText = "Sudah"
        color = "green-500"
        Icon = CheckCircle
    } else {
        statusText = "Belum"
        color = "red-500"
        Icon = XCircle
    }

    return (
        <Badge
            variant="outline"
            className={`text-muted-foreground px-1.5 gap-1.5 border-${color}`}
        >
            <Icon className={`w-4 h-4 text-${color}`} />
            <span>{statusText}</span>
        </Badge>
    )
}

// --- KOMPONEN LOKAL: TjslTable (dari table.tsx) ---
function TjslTable({ loading, tableData }: TjslTableProps) {
    const [searchTerm, setSearchTerm] = useState("");

    if (loading) {
        return (
            <div className="lg:col-span-3">
                <h3 className="font-semibold mb-4">Daftar Partisipasi Pegawai</h3>
                <Skeleton className="h-10 w-full mb-4" />
                <div className="space-y-2 border rounded-md p-2">
                    {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
            </div>
        )
    }

    const filteredData = tableData.filter(pegawai =>
        pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pegawai.nip.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="lg:col-span-3">
            <h3 className="font-semibold mb-4">Daftar Partisipasi Pegawai</h3>
            <Input
                type="text"
                placeholder="Cari nama atau NIP pegawai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 "
            />
            <div className="border rounded-md max-h-[400px] overflow-y-auto ">
                <Table>
                    <TableHeader className="sticky top-0 bg-muted z-10">
                        <TableRow>
                            <TableHead className="pl-4 w-[43%]">Nama Pegawai</TableHead>
                            <TableHead className="w-[10%]">NIP</TableHead>
                            <TableHead className="text-center">Semester 1</TableHead>
                            <TableHead className="text-center">Semester 2</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? filteredData.map((pegawai) => (
                            <TableRow key={pegawai.nip}>
                                <TableCell className="pl-4 font-medium">{pegawai.nama}</TableCell>
                                <TableCell>{pegawai.nip}</TableCell>
                                <TableCell className="text-center">
                                    <StatusBadge status={pegawai.s1_status} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <StatusBadge status={pegawai.s2_status} />
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                {tableData.length === 0 ? "Belum ada data untuk periode ini" : "Pegawai tidak ditemukan."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}


export function ChartRadialTjsl({ loading, chartData, semester, setSemester }: ChartRadialTjslProps) {
    
    // Skeleton UI saat data sedang dimuat
    if (loading) {
        return (
            <div className="lg:col-span-2">
                <div className="flex flex-col items-center">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-9 w-48" />
                </div>
                <div className="flex justify-center items-center h-[150px] mt-4">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <div className="flex w-full justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4" /></div>
                    <div className="flex w-full justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4" /></div>
                </div>
            </div>
        )
    }

    const sisa = chartData.target - chartData.realisasi;
    
    // Data untuk Recharts, dipecah menjadi realisasi dan sisa
    const chartDisplayData = [{
        name: semester,
        realisasi: chartData.realisasi,
        sisa: sisa > 0 ? sisa : 0, // Sisa tidak boleh negatif
    }];

    const percentage =
        chartData.target > 0
            ? (chartData.realisasi / chartData.target) * 100
            : 0
    const formattedPercentage = percentage.toFixed(2) + "%"

    return (
        <div className="lg:col-span-2">
            <div className="flex flex-col items-center">
                 <h3 className="font-semibold mb-2">Capaian Partisipasi</h3>
                 <Select value={semester} onValueChange={(val) => setSemester(val as SemesterFilter)}>
                    <SelectTrigger className="w-[180px] mt-2 mb-27">
                        <SelectValue placeholder="Pilih Periode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semester 1">Semester 1</SelectItem>
                        <SelectItem value="Semester 2">Semester 2</SelectItem>
                        <SelectItem value="Akumulasi">Akumulasi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex-1 flex items-center pb-0 mt-4 h-[150px] [&_*]:focus:outline-none">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
                    <RadialBarChart
                        data={chartDisplayData}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={100}
                        outerRadius={150}
                        barSize={40}
                    >

                        <PolarAngleAxis type="number" domain={[0, chartData.target]} tick={false} />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {formattedPercentage}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-sm"
                        >
                          {semester}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
                    </PolarRadiusAxis>
                        
                        <RadialBar
                            dataKey="realisasi"
                            stackId="a"
                            cornerRadius={6}
                            fill="rgb(14, 165, 233)"
                            className="stroke-transparent stroke-2"
                        />
                        {/* Bar untuk Sisa Target (abu-abu) */}
                        <RadialBar
                            dataKey="sisa"
                            stackId="a"
                            cornerRadius={6}
                            fill="rgb(186, 230, 253)"
                            className="stroke-transparent stroke-2"
                        />
                        
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 10} className="fill-foreground text-3xl font-bold">
                                                {percentage.toFixed(1)}%
                                            </tspan>
                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 15} className="fill-muted-foreground text-sm">
                                                Partisipasi
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </div>
            <div className="flex-col gap-2 text-sm mt-4">
                <div className="flex items-center justify-between w-full border-t pt-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500"/>
                        <div className="text-muted-foreground">Realisasi</div>
                    </div>
                    <div className="font-medium">{chartData.realisasi} Partisipasi</div>
                </div>
                <div className="flex items-center justify-between w-full border-t pt-2 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-200" />
                        <div className="text-muted-foreground">Target</div>
                    </div>
                    <div className="font-medium">{chartData.target} Partisipasi</div>
                </div>
            </div>
        </div>
    )
}


// --- KOMPONEN UTAMA YANG DIEKSPOR ---
export function TableChartTJSL({ tahun }: { tahun: string }) {
    const [data, setData] = useState<TjslApiData[]>([])
    const [loading, setLoading] = useState(true)
    const [semester, setSemester] = useState<SemesterFilter>("Akumulasi")

    // --- Data Fetching ---
    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch(`/api/administrasi?type=tjsl&tahun=${tahun}`)
                if (!res.ok) throw new Error("Gagal mengambil data TJSL")
                const json = await res.json()
                setData(Array.isArray(json) ? json : [])
            } catch (error) {
                console.error("Failed to fetch TJSL data:", error)
                setData([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [tahun])

    // --- Data Processing ---
    const { tableData, chartDataMap } = useMemo(() => {
        const processed: { [id: number]: ProcessedTableData } = {}
        let s1_realisasi = 0
        let s2_realisasi = 0
        
        for (const entry of data) {
            if (!entry.Pegawai) {
                continue; 
            }

            const { pegawaiId, semester, status, Pegawai } = entry
            if (!processed[pegawaiId]) {
                processed[pegawaiId] = {
                    nama: Pegawai.nama,
                    nip: Pegawai.nip,
                    s1_status: null,
                    s2_status: null,
                }
            }
            if (semester === "1") {
                processed[pegawaiId].s1_status = status
                if (status) s1_realisasi++
            } else if (semester === "2") {
                processed[pegawaiId].s2_status = status
                if (status) s2_realisasi++
            }
        }

        const totalPegawai = Object.keys(processed).length
        const sortedTableData = Object.values(processed).sort((a,b) => a.nama.localeCompare(b.nama));
        const chartDataMap: Record<SemesterFilter, ChartData> = {
            "Semester 1": { target: totalPegawai, realisasi: s1_realisasi },
            "Semester 2": { target: totalPegawai, realisasi: s2_realisasi },
            "Akumulasi": { target: totalPegawai * 2, realisasi: s1_realisasi + s2_realisasi },
        }

        return { tableData: sortedTableData, chartDataMap }
    }, [data])


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-bold text-xl text-black">TJSL</CardTitle>
                <CardDescription className="text-md text-zinc-400">Rekap Partisipasi - {tahun}</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                <TjslTable
                    loading={loading}
                    tableData={tableData}
                />
                <ChartRadialTjsl
                    loading={loading}
                    chartData={chartDataMap[semester]}
                    tahun={tahun}
                    semester={semester}
                    setSemester={setSemester}
                />
            </div>
        </Card>
    )
}