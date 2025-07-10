"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
  IconCircleCheckFilled,
  IconLoader,
  IconDotsVertical,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export type KeuanganType = "optimasi" | "aki" | "ao" | "attb"

const formatIDR = (value: number | string) => {
  const num = Number(value)
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num)
}

const KATEGORI_OPTIONS = [
  "Perjalanan Dinas Non Diklat",
  "Bahan Makanan & Konsumsi",
  "Alat dan Keperluan Kantor",
  "Barang Cetakan",
]

const selectColumn: ColumnDef<any> = {
  id: "select",
  header: ({ table }) => (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
}

const actionColumn: ColumnDef<any> = {
  id: "actions",
  header: () => null,
  cell: ({ row, table }) => {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    const handleDelete = async () => {
      const selectedRows = table.getFilteredSelectedRowModel().rows
      let deletePromises: Promise<any>[] = []

      if (selectedRows.length > 0) {
        selectedRows.forEach((r) => {
          const { id, type } = r.original
          if (!id || !type) throw new Error("Missing ID or type")
          deletePromises.push(fetch(`/api/keuangan?type=${type}&id=${id}`, { method: "DELETE" }))
        })
      } else {
        const { id, type } = row.original
        if (!id || !type) throw new Error("Missing ID or type")
        deletePromises.push(fetch(`/api/keuangan?type=${type}&id=${id}`, { method: "DELETE" }))
      }

      try {
        const results = await Promise.all(deletePromises)
        const failed = results.some((res) => !res.ok)
        if (failed) throw new Error()
        toast.success("Data berhasil dihapus.")
        window.location.reload()
      } catch (err) {
        toast.error("Gagal menghapus data.")
      } finally {
        setOpen(false)
      }
    }

    return (
      <div className="w-full h-full flex items-center justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault()
                const { id, type } = row.original
                if (!id || !type) {
                  toast.error("ID atau type tidak ditemukan.")
                  return
                }
                router.push(`/data/keuangan/edit/${id}?type=${type}`)
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setOpen(true)
                  }}
                  className="text-red-500 cursor-pointer"
                >
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
                    : "Hapus baris ini? Tindakan ini tidak bisa dibatalkan."}
                </p>
                <DialogFooter className="mt-4">
                  <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                  <Button className="cursor-pointer" variant="destructive" onClick={handleDelete}>Hapus</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  },
  enableSorting: false,
  enableHiding: false,
}

export function DataTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ALLOWED_TYPES: KeuanganType[] = ["optimasi", "aki", "ao", "attb"]
  const typeFromURL = (searchParams.get("type") as KeuanganType) || "optimasi"
  const [type, setType] = React.useState<KeuanganType>(
    ALLOWED_TYPES.includes(typeFromURL) ? typeFromURL : "optimasi"
  )

  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<any[]>([])
  const sorting = React.useMemo<SortingState>(() => {
    if (type === "ao" || type === "attb") {
      return [{ id: "tahun", desc: false }]
    }
    return [
      { id: "bulan", desc: false },
      { id: "tahun", desc: false }
    ]
  }, [type])

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [selectedYear, setSelectedYear] = React.useState<string>("all")
  const [selectedKategori, setSelectedKategori] = React.useState<string>("all")

  const baseColumns: ColumnDef<any>[] = [
    { accessorKey: "tahun", header: "Tahun" },
    {
    accessorKey: "bulan",
    header: "Bulan",
    sortingFn: (rowA, rowB, columnId) => {
      const order = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      const bulanA = rowA.getValue(columnId) as string;
      const bulanB = rowB.getValue(columnId) as string;
      const tahunA = Number(rowA.original.tahun);
      const tahunB = Number(rowB.original.tahun);

      if (tahunA !== tahunB) {
        return tahunB - tahunA;
      }

      return order.indexOf(bulanA) - order.indexOf(bulanB);
      }
    },
    { accessorKey: "semester", header: "Semester" },
    {
      accessorKey: "kategori",
      header: "Kategori",
      cell: ({ row }) =>
        row.original.kategori && (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.kategori}
          </Badge>
        ),
    },
    { accessorKey: "target", header: () => <div className="text-left">Target</div>, cell: ({ row }) => <div className="text-left">{formatIDR(row.original.target)}</div> },
    { accessorKey: "penetapan", header: () => <div className="text-left">Penetapan</div>, cell: ({ row }) => <div className="text-left">{formatIDR(row.original.penetapan)}</div> },
    { accessorKey: "optimasi", header: () => <div className="text-left">Optimasi</div>, cell: ({ row }) => <div className="text-left">{formatIDR(row.original.optimasi)}</div> },
    { accessorKey: "realisasi", header: () => <div className="text-left">Realisasi</div>, cell: ({ row }) => <div className="text-left">{formatIDR(row.original.realisasi)}</div> },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5 flex items-center gap-1">
          {row.original.status === "Done" ? <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4" /> : <IconLoader className="size-4 animate-spin" />}
          {row.original.status}
        </Badge>
      ),
    },
  ]

  const filteredCols = (keys: string[]) => baseColumns.filter(c => keys.includes((c as any).accessorKey))

  const columnsMap: Record<KeuanganType, ColumnDef<any>[]> = {
    optimasi: [selectColumn, ...filteredCols(['tahun', 'bulan', 'kategori', 'penetapan', 'optimasi', 'realisasi']), actionColumn],
    aki: [selectColumn, ...filteredCols(['tahun', 'bulan', 'target', 'realisasi']), actionColumn],
    ao: [selectColumn, ...filteredCols(['tahun', 'semester', 'target', 'realisasi']), actionColumn],
    attb: [selectColumn, ...filteredCols(['tahun', 'semester', 'target', 'realisasi']), actionColumn],
  }

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/keuangan?type=${type}`)
        const json = await res.json()
        setData(json)
      } catch {
        toast.error("Gagal memuat data.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [type])


  const years = React.useMemo(() => {
    const allYears = data.map((item) => item.tahun).filter(Boolean)
    return Array.from(new Set(allYears)).sort((a, b) => b - a)
  }, [data])

  const filteredData = React.useMemo(() => {
    let result = [...data]
    if (selectedYear !== "all") result = result.filter((item) => item.tahun?.toString() === selectedYear)
    if (type === "optimasi" && selectedKategori !== "all") result = result.filter((item) => item.kategori === selectedKategori)
    return result
  }, [data, selectedYear, selectedKategori, type])

  const table = useReactTable({
    data: filteredData,
    columns: columnsMap[type],
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id?.toString() ?? `${Math.random()}`,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // ✅ Remove this line:
    // onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    enableRowSelection: true,
  })


  if (isLoading) {
    const currentColumns = columnsMap[type] || []

    return (
      <div className="w-full flex flex-col gap-4 overflow-auto px-4 lg:px-6 py-6">
        {/* Optional: mimic the filter bar if you want */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-9 w-[160px]" />
            <Skeleton className="h-9 w-[135px]" />
            {type === "optimasi" && (
              <Skeleton className="h-9 w-[230px]" />
            )}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[140px]" />
            <Skeleton className="h-9 w-[120px]" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {currentColumns.map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-[90px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(6)].map((_, rowIndex) => (
                <TableRow key={rowIndex} className="h-12">
                  {currentColumns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Optional: pagination mimic */}
        <div className="flex justify-between items-center px-4">
          <Skeleton className="h-5 w-40 hidden lg:block" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md hidden lg:block" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Tabs
      value={type}
      onValueChange={(val) => {
        setType(val as KeuanganType)
        setSelectedKategori("all")
        router.replace(`/data/keuangan?type=${val}`)
      }}
      className="w-full flex-col gap-6 py-4 lg:py-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex gap-2 flex-wrap">
          <Select value={type} onValueChange={(val) => setType(val as KeuanganType)}>
            <SelectTrigger className="w-[160px] cursor-pointer" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent >
              <SelectItem className="cursor-pointer" value="optimasi">Optimasi 5.4</SelectItem>
              <SelectItem className="cursor-pointer" value="aki">Disburse AKI</SelectItem>
              <SelectItem className="cursor-pointer" value="ao">Penyerapan AO</SelectItem>
              <SelectItem className="cursor-pointer" value="attb">Penarikan ATTB</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[135px] cursor-pointer" size="sm">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">Semua Tahun</SelectItem>
              {years.map((year) => (
                <SelectItem className="cursor-pointer" key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {type === "optimasi" && (
            <Select value={selectedKategori} onValueChange={setSelectedKategori}>
              <SelectTrigger className="w-[230px] cursor-pointer" size="sm">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">Semua Kategori</SelectItem>
                {KATEGORI_OPTIONS.map((k) => (
                  <SelectItem className="cursor-pointer" key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Filter Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table.getAllColumns()
                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => router.push(`/data/keuangan/create?type=${type}`)}
          >
            <IconPlus />
            <span className="hidden lg:inline">Tambah Data</span>
          </Button>
        </div>
      </div>
      <TabsContent value={type} className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
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
                  <TableCell colSpan={columnsMap[type].length} className="h-24 text-center">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(val) => table.setPageSize(Number(val))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((n) => (
                    <SelectItem key={n} value={`${n}`}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
  )
}
