import { useMemo, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton"; // ShadCN Skeleton
import { Loader2 } from "lucide-react"; // Loader Icon

// Define DataItem type
type DataItem = {
  month: string;
  Penetapan: number;
  Optimasi: number;
  Realisasi: number;
};

const chartConfig: ChartConfig = {
  Penetapan: { label: "Penetapan", color: "var(--chart-1)" },
  Optimasi: { label: "Optimasi", color: "var(--chart-2)" },
  Realisasi: { label: "Realisasi", color: "var(--chart-3)" },
};

// Define month order for sorting
const monthOrder = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Sort months using the predefined monthOrder array
function sortMonths(months: string[]): string[] {
  return months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function calculateTotalKategori(dataPerTahun: { [category: string]: DataItem[] }): DataItem[] {
  const firstCategory = Object.keys(dataPerTahun)[0];
  const months = Array.isArray(dataPerTahun[firstCategory]) ? dataPerTahun[firstCategory].map((d) => d.month) : [];

  // Sort months according to the predefined month order
  const sortedMonths = sortMonths(months);

  return sortedMonths.map((month, index) => {
    const total: DataItem = { month, Penetapan: 0, Optimasi: 0, Realisasi: 0 };
    for (const category of Object.values(dataPerTahun)) {
      const item = category[index];
      if (item) {
        total.Penetapan += item.Penetapan;
        total.Optimasi += item.Optimasi;
        total.Realisasi += item.Realisasi;
      }
    }
    return total;
  });
}

export function ChartAreaGradient({ tahun }: { tahun: string }) {
  const [dataPerTahun, setDataPerTahun] = useState<{ [category: string]: DataItem[] }>({});
  const [kategori, setKategori] = useState("Semua Uraian");
  const [loading, setLoading] = useState(true);
  const [isAllZero, setIsAllZero] = useState(false);

  // Fetch data when 'tahun' changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/keuangan?type=optimasi&tahun=${tahun}`);
        const result = await res.json();

        // Log fetched data for debugging
        console.log("Fetched Data:", result);

        if (res.ok) {
          // Group data by category
          const groupedData = result.reduce((acc: { [key: string]: DataItem[] }, item: any) => {
            const category = item.kategori;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              month: item.bulan,
              Penetapan: item.penetapan,
              Optimasi: item.optimasi,
              Realisasi: item.realisasi,
            });
            return acc;
          }, {});

          const dataWithTotal = {
            "Semua Uraian": calculateTotalKategori(groupedData),
            ...groupedData,
          };
          setDataPerTahun(dataWithTotal);
          setIsAllZero(!Object.keys(groupedData).length); // Check if all data is zero
        } else {
          toast.error(result.error || "Terjadi kesalahan saat memuat data.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tahun]);

  const kategoriList = Object.keys(dataPerTahun);

  // Ensure that the data exists before accessing it
  const chartData = dataPerTahun[kategori] || [];

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
        <CardFooter className="justify-between px-6 pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    );
  }

  // No data available
  if (isAllZero) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optimasi</CardTitle>
          <CardDescription>(Januari – Desember) - {tahun}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          <span className="text-muted-foreground text-sm text-center">
            Tidak ada data untuk tahun{" "}
            <span className="font-semibold text-foreground">{tahun}</span>.
          </span>
        </CardContent>
        <CardFooter className="justify-between px-6 pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
        <div>
          <CardTitle>Optimasi 5.4</CardTitle>
          <CardDescription>
            {kategori} - {tahun}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {kategoriList.map((key) => (
                <SelectItem key={key} value={key}>
                  {key === "Semua Uraian" ? "Semua Uraian" : key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-[170px] lg:h-[450px]">
        <ChartContainer config={chartConfig} className="h-full w-full relative">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            {/* Removed Y-axis */}
            <ChartTooltip
              cursor={false}
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                const current = chartData.find((d) => d.month === label);
                if (!current) return null;
                return (
                  <div className="rounded-xl p-4 text-sm shadow-xl min-w-[220px] space-y-2 bg-white text-black">
                    {(["Penetapan", "Optimasi", "Realisasi"] as const).map((key) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block size-2 rounded-sm"
                            style={{ backgroundColor: chartConfig[key].color }}
                          />
                          <span className="text-muted-foreground">{key}</span>
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatRupiah(current[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <defs>
              {(["Penetapan", "Optimasi", "Realisasi"] as const).map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <Area dataKey="Realisasi" type="natural" fill="url(#fill-Realisasi)" stroke={chartConfig.Realisasi.color} />
            <Area dataKey="Optimasi" type="natural" fill="url(#fill-Optimasi)" stroke={chartConfig.Optimasi.color} />
            <Area dataKey="Penetapan" type="natural" fill="url(#fill-Penetapan)" stroke={chartConfig.Penetapan.color} />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="justify-center gap-6 pt-4 text-sm text-muted-foreground flex-wrap">
        {(["Realisasi", "Optimasi", "Penetapan"] as const).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-sm"
              style={{ backgroundColor: chartConfig[key].color }}
            />
            <span>{key}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
