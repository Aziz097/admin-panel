"use client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";

type SertifikatItem = {
  no: string;
  nama: string;
  status: string;
  keterangan?: string;
};

export function TableSertifikatTanah({ data }: { data: SertifikatItem[] }) {
  return (
    <div className="w-full">
      <div className="font-semibold mb-3">Daftar Sertifikat</div>
      <div className="overflow-x-auto rounded-lg border">
        <div className="max-h-[300px] overflow-y-auto"> {/* Set max-height and enable vertical scrolling */}
          <table className="min-w-[340px] w-full text-sm">
            <thead className="bg-muted text-zinc-700">
              <tr>
                <th className="p-2 text-left">No Sertifikat</th>
                <th className="p-2 text-left">Nama Tower</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-3 text-zinc-400">Belum ada data</td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.no} className="border-b last:border-none">
                    <td className="p-2">{item.no}</td>
                    <td className="p-2">{item.nama}</td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className={`text-muted-foreground px-1.5 gap-1 ${item.status === "Selesai"
                          ? "border-green-400"
                          : item.status === "Proses"
                          ? "border-yellow-400"
                          : "border-zinc-300"
                        }`}
                      >
                        {item.status === "Selesai" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : item.status === "Proses" ? (
                          <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                        )}
                        <span className="capitalize">{item.status}</span>
                      </Badge>
                    </td>
                    <td className="p-2">{item.keterangan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
