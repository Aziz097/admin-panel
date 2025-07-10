"use client";
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react"

type IndikatorItem = {
  indikator: string;
  kategori?: string;
  eviden: number;
  patuh: number;
};

export function TableKepatuhan({ data }: { data: IndikatorItem[] }) {
  return (
    <div className="w-full">
      <div className="font-semibold mb-3">Daftar Indikator Kepatuhan</div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-[340px] w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-700">
            <tr>
              <th className="p-2 text-left">Indikator</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Eviden</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-3 text-zinc-400">Belum ada data</td>
              </tr>
            ) : (
              data.map((item, idx) => {
                let status = "Selesai";
                let color = "green-500";
                let Icon = CheckCircle;
                if (item.patuh === 0) {
                  status = "Belum";
                  color = "zinc-400";
                  Icon = AlertTriangle;
                } else if (item.patuh < item.eviden) {
                  status = "Proses";
                  color = "yellow-500";
                  Icon = Loader2;
                }
                return (
                  <tr key={`${item.indikator}-${idx}`} className="border-b last:border-none">
                    <td className="p-2">{item.indikator}</td>
                    <td className="p-2">{item.kategori || "-"}</td>
                    <td className="p-2">{item.patuh} / {item.eviden}</td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className={`text-muted-foreground px-1.5 gap-1 border-${color}`}
                      >
                        <Icon className={`w-4 h-4 ${status === "Selesai" ? "text-green-500" : status === "Belum" ? "text-zinc-400" : "text-yellow-500"} ${status === "Proses" ? "animate-spin" : ""}`} />
                        <span>{status}</span>
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}