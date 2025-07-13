"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, HelpCircle } from "lucide-react"

// --- Type Definitions ---
type ProcessedTableData = {
    nama: string
    nip: string
    s1_status: boolean | null
    s2_status: boolean | null
}

interface TjslTableProps {
    loading: boolean
    tableData: ProcessedTableData[]
}

// --- Komponen StatusBadge ---
// Komponen ini dibuat untuk menangani logika tampilan badge secara terpusat.
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


// --- Komponen Tabel Utama ---
export function TjslTable({ loading, tableData }: TjslTableProps) {

    const [searchTerm, setSearchTerm] = useState("");
    // Skeleton UI saat loading
    if (loading) {
        return (
            <div className="lg:col-span-2">
                <h3 className="font-semibold mb-4">Daftar Partisipasi Pegawai</h3>
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
        <div className="lg:col-span-2">
            <h3 className="font-semibold mb-4">Daftar Partisipasi Pegawai</h3>
            <Input
                type="text"
                placeholder="Cari nama atau NIP pegawai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
            />
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-muted z-10">
                        <TableRow>
                            <TableHead className="w-[40%]">Nama Pegawai</TableHead>
                            <TableHead>NIP</TableHead>
                            <TableHead className="text-center">Semester 1</TableHead>
                            <TableHead className="text-center">Semester 2</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? filteredData.map((pegawai) => (
                            <TableRow key={pegawai.nip}>
                                <TableCell className="font-medium">{pegawai.nama}</TableCell>
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
                                {tableData.length === 0 ? "Tidak ada data untuk ditampilkan." : "Pegawai tidak ditemukan."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}