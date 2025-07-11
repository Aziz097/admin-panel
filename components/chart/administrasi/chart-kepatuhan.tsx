"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

// Mapping month numbers to full names
const bulanMapping: Record<string, string> = {
  "01": "Januari",
  "02": "Februari",
  "03": "Maret",
  "04": "April",
  "05": "Mei",
  "06": "Juni",
  "07": "Juli",
  "08": "Agustus",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember",
};

// Chart config
const chartConfig: ChartConfig = {
  realisasi: {
    label: "Realisasi",
    color: "black",
  },
  sisa: {
    label: "Sisa Target",
    color: "rgba(0, 0, 0, 0.3)",
  },
};


function formatPersen(value: number) {
  return `${value.toFixed(0)}`;
}

// Month list for select dropdown
const bulanList = Object.entries(bulanMapping)
  .map(([value, label]) => ({ label, value }))
  .sort((a, b) => parseInt(a.value) - parseInt(b.value)); // Sort by month value

export function KepatuhanChart({ tahun }: { tahun: string }) {
  const [bulan, setBulan] = useState("01");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on year change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/administrasi?type=kepatuhan&tahun=${tahun}`);
      const result = await res.json();
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, [tahun]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );
    const result = months.map((month) => ({
      month,
      target: 0,
      realisasi: 0,
      sisa: 0,
    }));

    data.forEach((item) => {
      const idx = months.findIndex((m) => m === item.bulan);
      if (idx !== -1 && item.tahun === tahun) {
        result[idx].target += item.target;
        result[idx].realisasi += item.realisasi;
        result[idx].sisa = result[idx].target - result[idx].realisasi;
      }
    });

    return result;
  }, [data, tahun]);

  const tableData = data.filter(
    (item) => item.bulan === bulan && item.tahun === tahun
  );

  const isAllZero = chartData.every(
    (d) => d.realisasi === 0 && d.sisa === 0
  );

  // If all the data is zero, show the no data message
  if (isAllZero && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl text-black">Kepatuhan</CardTitle>
          <CardDescription className="text-zinc-400">Rekap Indikator Kepatuhan {tahun}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          <span className="text-muted-foreground text-sm text-center">
            Belum ada data untuk tahun{" "}
            <span className="font-semibold text-foreground">{tahun}</span>.
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black">Kepatuhan</h2>
          <p className="text-sm text-zinc-400">Rekap Indikator Kepatuhan {tahun}</p>
        </div>
        <Select value={bulan} onValueChange={setBulan}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart Section */}
        <div className="w-full lg:w-1/2">
          <Card className="rounded-2xl border border-zinc-200 bg-white shadow-none px-4 py-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">
                Capaian Kepatuhan Indikator
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Januari – Desember {tahun}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[270px]">
              {isLoading ? (
                <div className="w-full h-full flex justify-center items-center">
                  {/* Skeleton loader while data is being fetched */}
                  <Loader2 className="animate-spin w-10 h-10 text-zinc-400" />
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={chartData} barCategoryGap={"20%"}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) =>
                        bulanMapping[value]?.slice(0, 3) || ""
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={({ payload, label }) => {
                        if (!payload?.length) return null;

                        // Ensure label is defined and exists in mapping
                        if (typeof label !== "string" || !bulanMapping[label])
                          return null;

                        const current = chartData.find(
                          (d) => d.month === label
                        );
                        if (!current) return null;

                        return (
                          <div className="rounded-xl p-3 shadow-xl min-w-[170px] space-y-1 bg-white text-black border border-zinc-100">
                            <div className="font-semibold text-base mb-1">
                              {bulanMapping[label]}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <span
                                  className="inline-block size-2 rounded-sm"
                                  style={{
                                    backgroundColor: chartConfig.sisa.color,
                                  }}
                                />
                                <span className="text-muted-foreground">
                                  Target
                                </span>
                              </span>
                              <span className="font-medium tabular-nums">
                                {formatPersen(current.target)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <span
                                  className="inline-block size-2 rounded-sm"
                                  style={{
                                    backgroundColor:
                                      chartConfig.realisasi.color,
                                  }}
                                />
                                <span className="text-muted-foreground">
                                  Realisasi
                                </span>
                              </span>
                              <span className="font-medium tabular-nums">
                                {formatPersen(current.realisasi)}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="realisasi"
                      stackId="a"
                      fill={chartConfig.realisasi.color}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="sisa"
                      stackId="a"
                      fill={chartConfig.sisa.color}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardFooter className="justify-center gap-6 pt-4 pb-2 text-sm text-muted-foreground flex-wrap">
              {chartData.some((data) => data.target > 0 || data.realisasi > 0) && (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: chartConfig.realisasi.color }}
                    />
                    <span>Realisasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: chartConfig.sisa.color }}
                    />
                    <span>Sisa Target</span>
                  </div>
                </>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-1/2">
          <div className="font-semibold mb-3">
            Daftar Indikator Kepatuhan {bulanMapping[bulan]} - {tahun}
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="max-h-[382px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-zinc-700">
                  <tr>
                    <th className="p-2 text-left">Indikator</th>
                    <th className="p-2 text-left">Kategori</th>
                    <th className="p-2 text-left">Eviden</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-3 text-zinc-400">
                        Belum ada data
                      </td>
                    </tr>
                  ) : (
                    tableData.map((item, idx) => {
                      let status = "Selesai";
                      let color = "green-500";
                      let Icon = CheckCircle;
                      if (item.realisasi === 0) {
                        status = "Belum";
                        color = "zinc-400";
                        Icon = AlertTriangle;
                      } else if (item.realisasi < item.target) {
                        status = "Proses";
                        color = "yellow-500";
                        Icon = Loader2;
                      }
                      return (
                        <tr
                          key={`${item.indikator}-${idx}`}
                          className="border-b last:border-none"
                        >
                          <td className="p-2">{item.indikator}</td>
                          <td className="p-2">{item.kategori || "-"}</td>
                          <td className="p-2">
                            {item.realisasi} / {item.target}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant="outline"
                              className={`text-muted-foreground px-1.5 gap-1 border-${color}`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  status === "Selesai"
                                    ? "text-green-500"
                                    : status === "Belum"
                                    ? "text-zinc-400"
                                    : "text-yellow-500"
                                } ${status === "Proses" ? "animate-spin" : ""}`}
                              />
                              <span>{status}</span>
                            </Badge>
                          </td>
                          <td className="p-2">{item.keterangan || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
