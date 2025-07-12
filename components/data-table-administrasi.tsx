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
    RowSelectionState,
} from '@tanstack/react-table';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconLayoutColumns,
    IconPlus,
    IconDotsVertical,
    IconTrash,
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
import { CheckCircle, Loader2, XCircle, Check, CircleX } from 'lucide-react';

export type AdministrasiType = 'komunikasi' | 'sertifikasi' | 'kepatuhan' | 'tjsl' | 'ocr';

// --- Helper & Constants ---
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

const KATEGORI_OCR_OPTIONS = ["Kategori A", "Kategori B", "Kategori C"];

// --- Column Definitions ---

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

const createActionColumn = (
    handleUpdateTjslStatus: (row: any, newStatus: boolean) => void
): ColumnDef<any> => ({
    id: 'actions',
    header: () => <div className="text-right pr-4">Aksi</div>,
    cell: ({ row }) => {
        const [open, setOpen] = React.useState(false);
        const router = useRouter();
        const item = row.original;

        const handleDelete = async () => {
            const { id, type } = item;
            if (!id || !type) {
                toast.error('ID atau tipe data tidak ditemukan.');
                return;
            }
            try {
                await fetch(`/api/administrasi?type=${type}&id=${id}`, { method: 'DELETE' });
                toast.success('Data berhasil dihapus.');
                router.refresh();
            } catch (err) {
                toast.error('Gagal menghapus data.');
            } finally {
                setOpen(false);
            }
        };

        return (
            <div className="w-full h-full flex items-center justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {item.type !== 'tjsl' && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/data/administrasi/edit/${item.id}?type=${item.type}`)}
                            >
                                Edit Data
                            </DropdownMenuItem>
                        )}
                        {item.type === 'tjsl' && (
                            <>
                                <DropdownMenuItem className="cursor-pointer" onSelect={() => handleUpdateTjslStatus(item, true)}>
                                    Tandai Sudah Ikut
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onSelect={() => handleUpdateTjslStatus(item, false)}>
                                    Tandai Belum Ikut
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={(e) => { e.preventDefault(); setOpen(true); }}
                                    className="text-red-500 cursor-pointer">
                                    Hapus Data
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                                </DialogHeader>
                                <p>Hapus baris ini? Tindakan ini tidak bisa dibatalkan.</p>
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
});

export function DataTable() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ALLOWED_TYPES: AdministrasiType[] = ['komunikasi', 'sertifikasi', 'kepatuhan', 'tjsl', 'ocr'];
    const typeFromURL = (searchParams.get('type') as AdministrasiType) || 'komunikasi';
    const [type, setType] = React.useState<AdministrasiType>(
        ALLOWED_TYPES.includes(typeFromURL) ? typeFromURL : 'komunikasi'
    );

    const [data, setData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Filter states
    const [allAvailableYears, setAllAvailableYears] = React.useState<string[]>([]);
    const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());
    const [selectedSemester, setSelectedSemester] = React.useState<string>('1');
    const [selectedTjslStatus, setSelectedTjslStatus] = React.useState<string>("all");
    const [selectedIndikator, setSelectedIndikator] = React.useState<string>("all");
    const [selectedKategoriOcr, setSelectedKategoriOcr] = React.useState<string>("all");
    
    const [isGenerateDialogOpen, setGenerateDialogOpen] = React.useState(false);
    const [isBulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

    // --- Data Fetching ---
    React.useEffect(() => {
        const fetchAllYearsForType = async () => {
            try {
                const res = await fetch(`/api/administrasi?type=${type}`);
                if (!res.ok) return;
                const json = await res.json();
                const yearsFromDb = Array.from(new Set(json.map((item: any) => item.tahun)));
                setAllAvailableYears(yearsFromDb as string[]);
            } catch (error) {
                console.error("Failed to fetch years:", error);
                setAllAvailableYears([]);
            }
        };
        fetchAllYearsForType();
    }, [type]);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            let url = `/api/administrasi?type=${type}`;
            if (type === 'tjsl') {
                if (selectedYear && selectedSemester) {
                    url += `&tahun=${selectedYear}&semester=${selectedSemester}`;
                } else {
                    setData([]);
                    setIsLoading(false);
                    return;
                }
            }
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error("Gagal mengambil data dari server");
                const json = await res.json();
                const dataWithType = Array.isArray(json) ? json.map((item: any) => ({ ...item, type })) : [];
                setData(dataWithType);
            } catch (error) {
                toast.error((error as Error).message || 'Gagal memuat data.');
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [type, selectedYear, selectedSemester, router]);

    // --- TJSL & Bulk Actions ---
    const handleGenerateTjsl = async (tahun: string, semester: string) => {
        try {
            const res = await fetch('/api/administrasi?type=tjsl&action=generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tahun, semester }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Gagal generate data');
            toast.success(result.message);
            setGenerateDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };
    
    const handleUpdateTjslStatus = async (row: any, newStatus: boolean) => {
        const { pegawaiId, tahun, semester } = row;
        try {
            await fetch('/api/administrasi?type=tjsl', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pegawaiId, tahun, semester, status: newStatus }),
            });
            toast.success('Status berhasil diupdate.');
            router.refresh();
        } catch (error) {
             toast.error((error as Error).message);
        }
    };
    
    const handleBulkUpdateTjslStatus = async (newStatus: boolean) => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const promises = selectedRows.map(row => {
            const { pegawaiId, tahun, semester } = row.original;
            return fetch('/api/administrasi?type=tjsl', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pegawaiId, tahun, semester, status: newStatus }),
            });
        });

        try {
            await Promise.all(promises);
            toast.success(`Berhasil mengupdate ${selectedRows.length} data.`);
            setRowSelection({});
            router.refresh();
        } catch (error) {
            toast.error("Gagal melakukan update massal.");
        }
    };
    
    const handleBulkDelete = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const promises = selectedRows.map(row => {
            const { id, type } = row.original;
            return fetch(`/api/administrasi?type=${type}&id=${id}`, {
                method: 'DELETE',
            });
        });

        try {
            await Promise.all(promises);
            toast.success(`Berhasil menghapus ${selectedRows.length} data.`);
            setRowSelection({});
            setBulkDeleteDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Gagal melakukan hapus massal.");
        }
    };


    // --- Column Definitions ---
    const baseColumns: ColumnDef<any>[] = [
        { accessorKey: 'tahun', header: 'Tahun' },
        { accessorKey: 'bulan', header: 'Bulan', cell: ({ row }) => getMonthName(row.original.bulan) },
        { accessorKey: 'keterangan', header: 'Keterangan' },
        { accessorKey: 'target', header: 'Target' },
        { accessorKey: 'realisasi', header: 'Realisasi' },
        { accessorKey: 'namaIndikator', header: 'Nama Indikator' },
        { accessorKey: 'nomor', header: 'Nomor' },
        { accessorKey: 'nama', header: 'Nama Sertifikasi' },
        { accessorKey: 'indikator', header: 'Indikator' },
        { accessorKey: 'kategori', header: 'Kategori' },
        { accessorKey: 'Pegawai.nama', header: 'Nama Pegawai', filterFn: 'includesString' },
        { accessorKey: 'Pegawai.nip', header: 'NIP', filterFn: 'includesString' },
        { accessorKey: 'Pegawai.jabatan', header: 'Jabatan' },
        { accessorKey: 'semester', header: 'Semester' },
        { accessorKey: 'kategoriOCR', header: 'Kategori OCR' },
        { 
            accessorKey: 'status', 
            header: 'Status', 
            cell: ({ row }) => {
                const status = row.original.status;
                if (typeof status === 'boolean') {
                    return (
                        <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 ${
                                status
                                ? "border-green-500"
                                : "border-red-500"
                            }`}
                            >
                            {status ? (
                                <CheckCircle className="w-4 h-4  text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4  text-red-500" />
                            )}
                            {status ? "Sudah Ikut" : "Belum Ikut"}
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

    const actionColumn = React.useMemo(() => createActionColumn(handleUpdateTjslStatus), []);

    const columnsMap: Record<AdministrasiType, ColumnDef<any>[]> = {
        komunikasi: [selectColumn, ...filteredCols(['tahun', 'bulan', 'namaIndikator', 'target', 'realisasi']), actionColumn],
        sertifikasi: [selectColumn, ...filteredCols(['tahun', 'bulan', 'nomor', 'nama', 'status', 'keterangan']), actionColumn],
        kepatuhan: [selectColumn, ...filteredCols(['tahun', 'bulan', 'indikator', 'kategori', 'target', 'realisasi', 'keterangan']), actionColumn],
        tjsl: [selectColumn, ...filteredCols(['tahun', 'semester', 'Pegawai.nama', 'Pegawai.nip', 'Pegawai.jabatan', 'status']), actionColumn],
        ocr: [selectColumn, ...filteredCols(['tahun', 'semester', 'kategoriOCR', 'target', 'realisasi']), actionColumn],
    };

    // --- Table Instance & Data Filtering ---
    const filteredData = React.useMemo(() => {
        let result = [...data];
        
        if (type === 'tjsl') {
            if (selectedTjslStatus !== 'all') {
                result = result.filter(item => item.status.toString() === selectedTjslStatus);
            }
            result.sort((a, b) => (a.status === b.status) ? 0 : a.status ? 1 : -1);
        } else {
            if (selectedYear !== 'all') {
                result = result.filter((item) => item.tahun?.toString() === selectedYear);
            }
        }

        if (type === 'komunikasi' && selectedIndikator !== 'all') {
            result = result.filter((item) => item.namaIndikator === selectedIndikator);
        }
        if (type === 'ocr' && selectedKategoriOcr !== 'all') {
            result = result.filter((item) => item.kategoriOCR === selectedKategoriOcr);
        }
        return result;
    }, [data, selectedYear, selectedTjslStatus, selectedIndikator, selectedKategoriOcr, type]);

    const table = useReactTable({
        data: filteredData,
        columns: columnsMap[type],
        state: { sorting, columnFilters, columnVisibility, pagination, rowSelection, globalFilter },
        getRowId: (row) => row.id?.toString() ?? `${Math.random()}`,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        enableRowSelection: true,
    });

    const bulkActionState = React.useMemo(() => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        if (selectedRows.length === 0) return 'none';
        
        const allFalse = selectedRows.every(row => row.original.status === false);
        if (allFalse) return 'setSudah';

        const allTrue = selectedRows.every(row => row.original.status === true);
        if (allTrue) return 'setBelum';

        return 'none';
    }, [rowSelection, filteredData]);

    const yearDropdownOptions = React.useMemo(() => {
        const currentYear = new Date().getFullYear().toString();
        const uniqueYears = Array.from(new Set([currentYear, ...allAvailableYears]));
        return uniqueYears.sort((a, b) => Number(b) - Number(a));
    }, [allAvailableYears]);


    return (
        <div className="w-full flex-col gap-6 py-4 lg:py-6">
            {/* --- Header & Filters --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
                <div className="flex gap-2 flex-wrap items-center">
                    <Select value={type} onValueChange={(val) => {
                        const newType = val as AdministrasiType;
                        setType(newType);
                        setRowSelection({});
                        if (newType === 'tjsl') {
                            setSelectedYear(new Date().getFullYear().toString());
                        }
                        router.replace(`/data/administrasi?type=${newType}`);
                    }}>
                        <SelectTrigger className="w-[150px]" size="sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="komunikasi">Komunikasi</SelectItem>
                            <SelectItem value="sertifikasi">Sertifikasi Tanah</SelectItem>
                            <SelectItem value="kepatuhan">Kepatuhan</SelectItem>
                            <SelectItem value="tjsl">TJSL</SelectItem>
                            <SelectItem value="ocr">OCR</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[150px]" size="sm"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
                        <SelectContent>
                            {type !== 'tjsl' && <SelectItem value="all">Semua Tahun</SelectItem>}
                            {yearDropdownOptions.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {type === 'tjsl' && (
                        <>
                            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                <SelectTrigger className="w-[150px]" size="sm"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Semester 1</SelectItem>
                                    <SelectItem value="2">Semester 2</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedTjslStatus} onValueChange={setSelectedTjslStatus}>
                                <SelectTrigger className="w-[150px]" size="sm"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="true">Sudah Ikut</SelectItem>
                                    <SelectItem value="false">Belum Ikut</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Cari nama atau nip..."
                                value={globalFilter ?? ''}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="h-9 w-[150px] lg:w-[200px]"
                            />
                        </>
                    )}
                    {/* Other filters... */}
                </div>
                <div className="flex items-center gap-2">
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                    <IconTrash className="h-4 w-4 mr-2" />
                                    Hapus ({table.getFilteredSelectedRowModel().rows.length})
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Hapus Massal</DialogTitle>
                                    <DialogDescription>
                                        Apakah Anda yakin ingin menghapus {table.getFilteredSelectedRowModel().rows.length} data terpilih? Tindakan ini tidak dapat dibatalkan.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>Batal</Button>
                                    <Button variant="destructive" onClick={handleBulkDelete}>Ya, Hapus Semua</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {type === 'tjsl' && bulkActionState === 'setSudah' && (
                        <Button size="sm" variant="outline" onClick={() => handleBulkUpdateTjslStatus(true)}>
                            <Check className="h-4 w-4 mr-2" /> Tandai Sudah Semua
                        </Button>
                    )}
                    {type === 'tjsl' && bulkActionState === 'setBelum' && (
                        <Button size="sm" variant="outline" onClick={() => handleBulkUpdateTjslStatus(false)}>
                            <CircleX className="h-4 w-4 mr-2" /> Tandai Belum Semua
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm"><IconLayoutColumns className="h-4 w-4 mr-2"/><span className="hidden lg:inline">Filter Kolom</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                                <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(val) => col.toggleVisibility(!!val)}>
                                    {col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {type === 'tjsl' ? (
                        <Dialog open={isGenerateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><IconPlus className="h-4 w-4 mr-2" />Generate</Button>
                            </DialogTrigger>
                            <GenerateTjslDialog onGenerate={handleGenerateTjsl} onOpenChange={setGenerateDialogOpen} />
                        </Dialog>
                    ) : (
                        <Button size="sm" variant="outline" onClick={() => router.push(`/data/administrasi/create?type=${type}`)}><IconPlus className="h-4 w-4 mr-2" /><span className="hidden lg:inline">Tambah Data</span></Button>
                    )}
                </div>
            </div>

            {/* --- Table --- */}
            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 mt-4">
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
                            {isLoading ? (
                                <TableRow><TableCell colSpan={columnsMap[type].length} className="h-24 text-center">Memuat data...</TableCell></TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={columnsMap[type].length} className="h-24 text-center">Tidak ada data.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* --- Pagination --- */}
                <div className="flex items-center justify-between pt-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {Object.keys(rowSelection).length} dari{' '}
                        {table.getFilteredRowModel().rows.length} baris terpilih.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">Baris per halaman</Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(val) => table.setPageSize(Number(val))}>
                                <SelectTrigger size="sm" className="w-20 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 font-semibold" id="rows-per-page"><SelectValue /></SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 25, 50, 100, 200].map((n) => (<SelectItem key={n} value={`${n}`}>{n}</SelectItem>))}
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
            </div>
        </div>
    );
}

// --- Sub-component for Generate TJSL Dialog ---
function GenerateTjslDialog({ onGenerate, onOpenChange }: { onGenerate: (tahun: string, semester: string) => void, onOpenChange: (open: boolean) => void }) {
    const [tahun, setTahun] = React.useState(new Date().getFullYear().toString());
    const [semester, setSemester] = React.useState('1');

    const handleSubmit = () => {
        if (!tahun || !semester) {
            toast.warning("Tahun dan semester harus diisi.");
            return;
        }
        onGenerate(tahun, semester);
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Generate Data TJSL</DialogTitle>
                <DialogDescription>
                    Tindakan ini akan membuat record partisipasi TJSL untuk semua pegawai aktif pada periode yang dipilih.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tahun" className="text-right">Tahun</Label>
                    <Input id="tahun" value={tahun} onChange={(e) => setTahun(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semester" className="text-right">Semester</Label>
                     <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                <Button onClick={handleSubmit}>Generate</Button>
            </DialogFooter>
        </DialogContent>
    );
}
