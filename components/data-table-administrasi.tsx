"use client"

import * as React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconLayoutColumns,
    IconPlus,
    IconDotsVertical,
} from '@tabler/icons-react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

// **DIUBAH**: Menambahkan 'tjsl' ke dalam tipe
export type AdministrasiType = 'komunikasi' | 'sertifikasi' | 'kepatuhan' | 'tjsl';

const getMonthName = (monthNum: string): string => {
    const monthNames: { [key: string]: string } = {
        '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', 
        '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', 
        '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
    };
    return monthNames[monthNum] || monthNum;
};

const INDIKATOR_KOMUNIKASI_OPTIONS = [
    "Release Berita", "Konten Foto", "Akun Influencer Aktif",
    "Share Berita Internal", "Scoring Publikasi", "Laporan Permintaan Publik",
];

const selectColumn: ColumnDef<any> = {
    id: 'select',
    header: ({ table }) => (
        <div className="flex items-center justify-center">
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        </div>
    ),
    cell: ({ row }) => (
        <div className="flex items-center justify-center">
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        </div>
    ),
    enableSorting: false,
    enableHiding: false,
};

const actionColumn: ColumnDef<any> = {
    id: 'actions',
    header: () => null,
    cell: ({ row, table }) => {
        const [open, setOpen] = React.useState(false);
        const router = useRouter();
        const item = row.original;

        const handleDelete = async () => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            let deletePromises: Promise<any>[] = [];

            if (selectedRows.length > 0) {
                selectedRows.forEach((r) => {
                    const { id, type } = r.original;
                    if (!id || !type) throw new Error('Missing ID or type');
                    deletePromises.push(
                        fetch(`/api/administrasi?type=${type}&id=${id}`, { method: 'DELETE' })
                    );
                });
            } else {
                const { id, type } = row.original;
                if (!id || !type) throw new Error('Missing ID or type');
                deletePromises.push(
                    fetch(`/api/administrasi?type=${type}&id=${id}`, { method: 'DELETE' })
                );
            }

            try {
                await Promise.all(deletePromises);
                toast.success('Data berhasil dihapus.');
                window.location.reload()
            } catch (err) {
                toast.error('Gagal menghapus data.');
            } finally {
                setOpen(false);
            }
        };

        return (
            <div className="w-full h-full flex items-center justify-end pr-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push(`/data/administrasi/edit/${item.id}?type=${item.type}`)}
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={(e) => { e.preventDefault(); setOpen(true); }}
                                    className="text-red-500 cursor-pointer">
                                    Hapus
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                                </DialogHeader>
                                <p>
                                    {table.getFilteredSelectedRowModel().rows.length > 0
                                        ? `Hapus ${table.getFilteredSelectedRowModel().rows.length} baris terpilih? Tindakan ini tidak bisa dibatalkan.`
                                        : 'Hapus baris ini? Tindakan ini tidak bisa dibatalkan.'}
                                </p>
                                <DialogFooter className="mt-4">
                                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                    <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    },
    enableSorting: false,
    enableHiding: false,
};

export function DataTable() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // **DIUBAH**: Menambahkan 'tjsl' ke dalam array
    const ALLOWED_TYPES: AdministrasiType[] = ['komunikasi', 'sertifikasi', 'kepatuhan', 'tjsl'];
    const typeFromURL = (searchParams.get('type') as AdministrasiType) || 'komunikasi';
    const [type, setType] = React.useState<AdministrasiType>(
        ALLOWED_TYPES.includes(typeFromURL) ? typeFromURL : 'komunikasi'
    );

    const [data, setData] = React.useState<any[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const [selectedYear, setSelectedYear] = React.useState<string>('all');
    const [selectedIndikator, setSelectedIndikator] = React.useState<string>("all");

    const baseColumns: ColumnDef<any>[] = [
        // Common
        { accessorKey: 'tahun', header: 'Tahun' },
        { accessorKey: 'bulan', header: 'Bulan', cell: ({ row }) => getMonthName(row.original.bulan) },
        { accessorKey: 'nama', header: 'Nama' },
        { accessorKey: 'keterangan', header: 'Keterangan' },
        
        // Komunikasi
        { accessorKey: 'namaIndikator', header: 'Nama Indikator' },
        { accessorKey: 'target', header: 'Target' },
        { accessorKey: 'realisasi', header: 'Realisasi' },

        // Sertifikasi
        { accessorKey: 'nomor', header: 'Nomor' },
        
        // Kepatuhan
        { accessorKey: 'indikator', header: 'Indikator' },
        { accessorKey: 'kategori', header: 'Kategori' },
        
        // TJSL
        { accessorKey: 'nip', header: 'NIP' },
        { accessorKey: 'jabatan', header: 'Jabatan' },

        // Status (handles multiple types)
        { 
            accessorKey: 'status', 
            header: 'Status', 
            cell: ({ row }) => {
                const status = row.original.status;
                if (typeof status === 'boolean') {
                    return (
                        <Badge variant="outline" className="text-muted-foreground px-1.5 flex items-center gap-1">
                            {status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-yellow-500" />}
                            {status ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                    );
                }
                if (typeof status === 'string') {
                    return (
                        <Badge variant="outline" className="text-muted-foreground px-1.5 flex items-center gap-1">
                            {status === 'Selesai' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />}
                            {status}
                        </Badge>
                    );
                }
                return null;
            }
        },
    ];

    const filteredCols = (keys: string[]) =>
        keys
            .map(key => baseColumns.find((c: any) => c.accessorKey === key))
            .filter(Boolean) as ColumnDef<any>[];

    const columnsMap: Record<AdministrasiType, ColumnDef<any>[]> = {
        komunikasi: [selectColumn, ...filteredCols(['tahun', 'bulan', 'namaIndikator', 'target', 'realisasi']), actionColumn],
        sertifikasi: [selectColumn, ...filteredCols(['tahun', 'bulan', 'nomor', 'nama', 'status', 'keterangan']), actionColumn],
        kepatuhan: [selectColumn, ...filteredCols(['tahun', 'bulan', 'indikator', 'kategori', 'target', 'realisasi', 'keterangan']), actionColumn],
        tjsl: [selectColumn, ...filteredCols(['tahun', 'bulan', 'nama', 'nip', 'jabatan', 'status']), actionColumn],
    };


    React.useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/administrasi?type=${type}`);
                if (!res.ok) throw new Error("Gagal mengambil data dari server");
                const json = await res.json();
                const dataWithType = json.map((item: any) => ({ ...item, type }));
                setData(dataWithType);
            } catch (error) {
                toast.error((error as Error).message || 'Gagal memuat data.');
            }
        }
        fetchData();
    }, [type, router]); // Add router to dependency array to refetch on refresh

    const years = React.useMemo(() => {
        const allYears = data.map((item) => item.tahun).filter(Boolean);
        return Array.from(new Set(allYears)).sort((a, b) => (b as number) - (a as number));
    }, [data]);

    const filteredData = React.useMemo(() => {
        let result = [...data];
        if (selectedYear !== 'all') {
            result = result.filter((item) => item.tahun?.toString() === selectedYear);
        }
        if (type === 'komunikasi' && selectedIndikator !== 'all') {
            result = result.filter((item) => item.namaIndikator === selectedIndikator);
        }
        return result;
    }, [data, selectedYear, selectedIndikator, type]);

    const table = useReactTable({
        data: filteredData,
        columns: columnsMap[type],
        state: { sorting, columnFilters, columnVisibility, pagination },
        getRowId: (row) => row.id?.toString() ?? `${Math.random()}`,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        enableRowSelection: true,
    });

    return (
        <Tabs
            value={type}
            onValueChange={(val) => {
                const newType = val as AdministrasiType;
                setType(newType);
                setSelectedIndikator("all");
                router.replace(`/data/administrasi?type=${newType}`);
            }}
            className="w-full flex-col gap-6 py-4 lg:py-6">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
                <div className="flex gap-2 flex-wrap">
                    <Select value={type} onValueChange={(val) => setType(val as AdministrasiType)}>
                        <SelectTrigger className="w-[180px]" size="sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="komunikasi">Komunikasi</SelectItem>
                            <SelectItem value="sertifikasi">Sertifikasi Tanah</SelectItem>
                            <SelectItem value="kepatuhan">Kepatuhan</SelectItem>
                            {/* **BARU**: Opsi untuk TJSL */}
                            <SelectItem value="tjsl">TJSL</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[135px]" size="sm"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {type === 'komunikasi' && (
                        <Select value={selectedIndikator} onValueChange={setSelectedIndikator}>
                          <SelectTrigger className="w-[230px]" size="sm"><SelectValue placeholder="Pilih Indikator" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Indikator</SelectItem>
                            {INDIKATOR_KOMUNIKASI_OPTIONS.map((indicator) => <SelectItem key={indicator} value={indicator}>{indicator}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm"><IconLayoutColumns className="h-4 w-4 mr-2"/><span className="hidden lg:inline">Columns</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                                <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(val) => col.toggleVisibility(!!val)}>
                                    {col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/data/administrasi/create?type=${type}`)}><IconPlus className="h-4 w-4 mr-2" /><span className="hidden lg:inline">Tambah Data</span></Button>
                </div>
            </div>
            <TabsContent
                value={type}
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columnsMap[type].length}
                                        className="h-24 text-center">
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between px-4 pt-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} dari{' '}
                        {table.getFilteredRowModel().rows.length} baris terpilih.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">Baris per halaman</Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(val) => table.setPageSize(Number(val))}>
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page"><SelectValue /></SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((n) => (<SelectItem key={n} value={`${n}`}>{n}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><IconChevronsLeft /></Button>
                            <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><IconChevronLeft /></Button>
                            <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><IconChevronRight /></Button>
                            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><IconChevronsRight /></Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
