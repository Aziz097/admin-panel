'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';  // Import Card component
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';  // Import Loader2 for the spinner
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'; // Importing Select components
import { Skeleton } from '@/components/ui/skeleton';  // ShadCN Skeleton loader component

// Types for the indicators (based on the data you provided)
type Indicator = {
    title: string;
    value: number;  // Value is always treated as a number, even if it was missing
    target: number;
    bulan: string;
    tahun: string;
    status?: 'done' | 'pending';
};

// Fetch data from the API based on bulan and tahun
const fetchIndicatorData = async (bulan: string, tahun: string) => {
    const res = await fetch(`/api/administrasi?type=komunikasi&bulan=${bulan}&tahun=${tahun}`);
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return await res.json(); // Assuming it returns the array of indicators
};

// Mapping month number to month name
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

// Placeholder indicator titles for the 6 cards
const indicatorTitles = [
    "Release Berita",
    "Konten Foto",
    "Akun Influencer Aktif",
    "Share Berita Internal",
    "Scoring Publikasi",
    "Laporan Permintaan Publik",
];

export function KomunikasiCards({ tahun }: { tahun: string }) {
    const [bulan, setBulan] = useState("01");
    const [data, setData] = useState<Indicator[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const apiData = await fetchIndicatorData(bulan, tahun);

                // Map the data to the correct structure for rendering
                const mappedData = apiData.map((item: any) => ({
                    title: item.namaIndikator,  // Using 'namaIndikator' from API as the title
                    value: item.realisasi ?? 0, // Treat missing value as 0
                    target: item.target || 0,
                    bulan: item.bulan,
                    tahun: item.tahun,
                    status: item.realisasi === item.target ? 'done' : 'pending',  // Assuming the status is based on comparison
                }));

                console.log('Mapped Data:', mappedData);  // Log the data for debugging
                setData(mappedData);
            } catch (error) {
                console.error('Error fetching indicator data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [bulan, tahun]);

    const renderProgressBar = (value: number, target: number) => {
        const percent = (value / target) * 100;
        return (
            <div className="flex items-center gap-2 mt-8">
                <div className="relative w-full h-2 rounded bg-zinc-200 overflow-hidden">
                    <div
                        className="absolute h-2 left-0 top-0 bg-black rounded"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className="text-xs text-black font-semibold">{percent.toFixed(0)}%</span>
            </div>
        );
    };

    const renderStatus = (status?: 'done' | 'pending') => {
        if (status === 'done') {
            return <CheckCircle className="w-22 h-22 text-black" strokeWidth={2.2} />;
        }
        if (status === 'pending') {
            return <AlertCircle className="w-22 h-22 text-black" strokeWidth={2.2} />;
        }
        return null;
    };

    // Check if the indicator is locked (both value and target are 0)
    const isLocked = (indicator: Indicator) => {
        return indicator.value === 0 && indicator.target === 0;
    };

    // Fill missing indicators with skeletons
    const fillMissingIndicators = () => {
        return indicatorTitles.map((title) => {
            const indicator = data.find((item) => item.title === title);
            return indicator || { title, value: 0, target: 0, bulan, tahun };
        });
    };

    // Sort months based on the numeric month value
    const sortedBulanList = Object.entries(bulanMapping)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([key, label]) => ({ value: key, label }));

    return (
        <div className="w-full rounded-2xl bg-white p-5 border border-zinc-200">
            <div className='flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6'>
                {/* Display the month name and year */}
                <div>
                    <div className="font-bold text-xl text-black">Komunikasi</div>
                    <div className="text-md text-zinc-400">Rekap 6 Indikator {bulanMapping[bulan]} - {tahun}</div>
                </div>
                {/* Month Selector Dropdown on the right */}
                <Select value={bulan} onValueChange={setBulan}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px]">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedBulanList.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                                {b.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* If loading, show spinner and skeletons */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Skeleton cards from ShadCN */}
                    {indicatorTitles.map((_, index) => (
                        <Card key={index} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
                            {/* Skeleton for Card Title */}
                            <Skeleton className="h-6 w-3/4" />
                            
                            {/* Skeleton for Subtext (e.g., month/year or info under the title) */}
                            <Skeleton className="h-4 w-1/2" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fillMissingIndicators().map((indicator, index) => (
                        // This is the correct condition for locked indicators based on value and target being 0
                        isLocked(indicator) ? (
                            <Card key={index} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
                                <div>
                                    <div className="font-bold text-lg text-black">{indicator.title}</div>
                                    <div className="text-sm text-zinc-500 mb-2">
                                        {bulanMapping[indicator.bulan]} - {indicator.tahun}
                                    </div>
                                </div>
                                {/* Only show "Tidak ada data" message if both value and target are 0 */}
                                {indicator.value === 0 && indicator.target === 0 ? (
                                    <div className="text-muted-foreground text-sm text-center">
                                        Belum ada data
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground text-sm font-medium">
                                        No data available for {indicator.title}
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card key={index} className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
                                <div>
                                    <div className="font-bold text-lg text-black">{indicator.title}</div>
                                    <div className="text-sm text-zinc-500 mb-2">
                                        {bulanMapping[indicator.bulan]} - {indicator.tahun}
                                    </div>
                                </div>

                                {indicator.title === "Laporan Permintaan Publik" ? (
                                    <div className="absolute bottom-0 left-0 flex items-baseline gap-1 p-6">
                                        <span className="text-4xl font-extrabold text-black">{indicator.value}</span>
                                        <span className="text-2xl font-bold text-zinc-400">/ {indicator.target}</span>
                                    </div>
                                ) : indicator.title === "Share Berita Internal" ? (
                                    // Do not display value and target for "Share Berita Internal"
                                    <></>
                                ) : (
                                    <div className="absolute right-6 top-6 flex items-end gap-1">
                                        <span className="text-5xl font-extrabold text-black">{indicator.value?.toLocaleString()}</span>
                                        <span className="text-3xl font-bold text-zinc-400">/ {indicator.target.toLocaleString()}</span>
                                    </div>
                                )}



                                {/* Handling the special case for "Laporan Permintaan Publik" status */}
                                {indicator.title === "Laporan Permintaan Publik" ? (
                                    <div className="flex flex-row-reverse items-end justify-between">
                                        <div className="flex flex-col items-end">
                                            {indicator.value === 0 ? (
                                                <AlertCircle className="w-22 h-22 text-black" strokeWidth={2.2} />
                                            ) : (
                                                <CheckCircle className="w-22 h-22 text-black" strokeWidth={2.2} />
                                            )}
                                        </div>
                                    </div>
                                ) : indicator.title === "Share Berita Internal" ? (
                                    <div className="flex flex-row-reverse items-end justify-between mt-auto">
                                        <div className="flex flex-col items-end">
                                            {indicator.value >= indicator.target ? (
                                                <CheckCircle className="w-22 h-22 text-black" strokeWidth={2.2} />
                                            ) : (
                                                <AlertCircle className="w-22 h-22 text-black" strokeWidth={2.2} />
                                            )}
                                        </div>
                                        <div className="text-base text-black font-medium">
                                            {indicator.value >= indicator.target ? 'Sudah Dishare!' : 'Belum Dishare!'}
                                        </div>
                                    </div>
                                ) : (
                                    renderProgressBar(indicator.value || 0, indicator.target)
                                )}
                            </Card>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}
