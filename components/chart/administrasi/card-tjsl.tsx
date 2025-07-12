"use client"

import * as React from "react"
import { TjslTable } from "./tjsl/table"
import { ChartRadialTjsl } from "./tjsl/chart-radial"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// --- Type Definitions ---
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

// --- Main Card Component ---
export function TableChartTJSL({ tahun }: { tahun: string }) {
    const [data, setData] = React.useState<TjslApiData[]>([])
    const [loading, setLoading] = React.useState(true)
    const [semester, setSemester] = React.useState<SemesterFilter>("Akumulasi")

    // --- Data Fetching ---
    React.useEffect(() => {
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
    const { tableData, chartDataMap } = React.useMemo(() => {
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
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
