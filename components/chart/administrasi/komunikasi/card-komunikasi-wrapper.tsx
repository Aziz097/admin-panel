"use client"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

const bulanList = [
  { label: "Januari", value: "01" },
  { label: "Februari", value: "02" },
  { label: "Maret", value: "03" },
  { label: "April", value: "04" },
  { label: "Mei", value: "05" },
  { label: "Juni", value: "06" },
  { label: "Juli", value: "07" },
  { label: "Agustus", value: "08" },
  { label: "September", value: "09" },
  { label: "Oktober", value: "10" },
  { label: "November", value: "11" },
  { label: "Desember", value: "12" },
]

export function KomunikasiCardWrapper({
  children,
  bulan,
  setBulan,
}: {
  children: React.ReactNode
  bulan: string
  setBulan: (val: string) => void
}) {
  return (
    <div className="w-full rounded-2xl bg-white p-5 border border-zinc-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <div className="text-2xl font-bold text-black">Komunikasi</div>
          <div className="text-zinc-500 text-base mb-1">Rekap 6 indikator komunikasi</div>
        </div>
        <Select value={bulan} onValueChange={setBulan}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent>
            {bulanList.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}
