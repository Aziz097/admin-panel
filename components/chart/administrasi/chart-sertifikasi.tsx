"use client";
import * as React from "react"
import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

// Month list for select dropdown, sorted by month number
const bulanList = Object.entries(bulanMapping)
  .map(([value, label]) => ({ label, value }))
  .sort((a, b) => parseInt(a.value) - parseInt(b.value)); // Sort by month value

// Remove unused chartConfig and formatPersen
// const chartConfig = { ... };
// function formatPersen(value: number) { ... }

// Define a type for sertifikatData
type SertifikatItem = {
  nomor: string;
  nama: string;
  status: string;
  keterangan?: string;
};

const getInitialMonth = (tahun: string) => {
  const now = new Date();
  if (tahun === String(now.getFullYear())) {
      return String(now.getMonth() + 1).padStart(2, '0');
  }
  return "01";
};

export function SertifikasiChart({ tahun }: { tahun: string }) {
  const [bulan, setBulan] = React.useState<string>(() => getInitialMonth(tahun));
  const [sertifikatData, setSertifikatData] = useState<SertifikatItem[]>([]); // Use the new type
  const [isLoading, setIsLoading] = useState(true); // Loading state for the chart
  const [isAllZero, setIsAllZero] = useState(false); // Flag to check if all data is zero

  // Fetch sertifikat data dynamically based on selected bulan (month) and tahun
  useEffect(() => {
    const fetchSertifikatData = async () => {
      setIsLoading(true); // Set loading state to true
      setIsAllZero(false); // Reset the zero check flag on new fetch

      try {
        const res = await fetch(`/api/administrasi?type=sertifikasi&tahun=${tahun}&bulan=${bulan}`);
        const result = await res.json();

        if (result.length === 0) {
          setIsAllZero(true); // Set to true if no data is returned
        }

        setSertifikatData(result); // Directly set the data as it is filtered server-side
      } catch (error) {
        console.error("Failed to fetch sertifikat data:", error);
      } finally {
        setIsLoading(false); // Set loading state to false once data is fetched
      }
    };

    fetchSertifikatData();
  }, [tahun, bulan]); // Dependency array makes sure it runs on year or month change

  // Calculate target (total items) and progress (only "Selesai" items)
  const targetValue = sertifikatData.length;
  const progressValue = sertifikatData.filter((item) => item.status === "Selesai").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-xl" >Sertifikasi Tanah</CardTitle>
          <CardDescription className="text-md text-zinc-400">Rekap Sertifikat Bulan {bulanMapping[bulan]} {tahun}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          {/* Skeleton loader */}
          <Loader2 className="animate-spin w-10 h-10 text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  if (isAllZero) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center flex-wrap">
          <div className="w-full sm:w-auto">
            <CardTitle className="font-bold text-xl text-black">Sertifikasi Tanah</CardTitle>
            <CardDescription className="text-md text-zinc-400">
              Rekap Sertifikat Bulan {bulanMapping[bulan]} {tahun}
            </CardDescription>
          </div>
          {/* Month picker aligned to the right, full width on mobile */}
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="h-9 cursor-pointer w-full sm:w-[140px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {bulanList.map((b) => (
                <SelectItem key={b.value} value={b.value} className="cursor-pointer">
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <AlertCircle className="w-4 h-4 me-3" />
              <span>Belum ada data untuk periode {bulanMapping[bulan]} - {tahun}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <div className="font-bold text-xl text-black">Sertifikasi Tanah</div>
          <div className="text-md text-zinc-400">Rekap Sertifikat Bulan {bulanMapping[bulan]} {tahun}</div>
        </div>
        <Select value={bulan} onValueChange={setBulan}>
          <SelectTrigger className="h-9 cursor-pointer w-full sm:w-[140px]">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sertifikat Table */}
        <div className="w-full">
          <div className="overflow-x-auto rounded-lg border">
            <div className="max-h-[300px] overflow-y-auto">
              {sertifikatData.length === 0 ? (
                <div className="text-center py-3 text-zinc-400">Belum ada data</div>
              ) : (
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
                    {sertifikatData.map((item) => (
                      <tr key={item.nomor} className="border-b last:border-none">
                        <td className="p-2">{item.nomor}</td>
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        {/* Radial Chart */}
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="font-semibold text-base mb-6">Progress Sertifikasi</div>
          <RadialBarChart
            width={320}
            height={300}
            innerRadius={120}
            outerRadius={185}
            startAngle={180}
            endAngle={0}
            data={[{ name: "Sertifikat", Target: 100, Realisasi: Math.round((progressValue / targetValue) * 100) }]}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            style={{ overflow: "visible" }}
            barSize={45}
          >
            <PolarRadiusAxis type="number" domain={[0, 100]} tick={false} axisLine={false} tickLine={false}>
              <Label
                position="insideBottom"
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 10}
                        textAnchor="middle"
                        fontWeight={900}
                        fontSize={40}
                        fill="#222"
                      >
                        {Math.round((progressValue / targetValue) * 100)}%
                      </text>
                    );
                  }
                  return null;
                }}
              />
              <Label
                position="insideBottom"
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 32}
                        textAnchor="middle"
                        fontSize={16}
                        fill="#222"
                      >
                        <tspan fontWeight="bold">{progressValue}</tspan> / {targetValue} Sertifikat Selesai
                      </text>
                    );
                  }
                  return null;
                } 
              }
              />
            </PolarRadiusAxis>
            <RadialBar dataKey="Realisasi" fill="#0ea5e9" stackId="a" cornerRadius={6} />
            <RadialBar dataKey="Target" fill="#bae6fd" stackId="a" cornerRadius={6} />
          </RadialBarChart>

        </div>
      </div>
    </div>
  );
}
