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
];

export function SertifikasiTanahWrapper({
  children,
  bulan,
  setBulan,
  labelBulan,
}: {
  children: React.ReactNode;
  bulan: string;
  setBulan: (v: string) => void;
  labelBulan: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <div className="font-bold text-2xl text-black">Sertifikasi Tanah</div>
          <div className="text-zinc-400">Rekap Sertifikat Bulan {labelBulan} 2024</div>
        </div>
        <Select value={bulan} onValueChange={setBulan}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent>
            {bulanList.map(b => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}