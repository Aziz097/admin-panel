'use client';
import * as React from "react"
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Types for the indicators (based on the data you provided)
type Indicator = {
    title: string;
    value: number;
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
    return await res.json();
};

// Mapping month number to month name
const bulanMapping: Record<string, string> = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April", "05": "Mei", "06": "Juni",
    "07": "Juli", "08": "Agustus", "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
};

// Placeholder indicator titles for the 6 cards
const indicatorTitles = [
    "Release Berita", "Konten Foto", "Akun Influencer Aktif",
    "Share Berita Internal", "Scoring Publikasi", "Laporan Permintaan Publik",
];

const getInitialMonth = (tahun: string) => {
    const now = new Date();
    if (tahun === String(now.getFullYear())) {
        return String(now.getMonth() + 1).padStart(2, '0');
    }
    return "01";
};

export function KomunikasiCards({ tahun }: { tahun: string }) {
    const [bulan, setBulan] = React.useState<string>(() => getInitialMonth(tahun));
    const [data, setData] = useState<Indicator[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const apiData = await fetchIndicatorData(bulan, tahun);
                const mappedData = apiData.map((item: any) => ({
                    title: item.namaIndikator, value: item.realisasi ?? 0, target: item.target || 0,
                    bulan: item.bulan, tahun: item.tahun,
                    status: item.realisasi === item.target ? 'done' : 'pending',
                }));
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
        const percent = target > 0 ? (value / target) * 100 : 0;
        const isComplete = percent >= 100;
        return (
            <div className="flex items-center gap-2 mt-8">
                {/* Progress bar dengan warna netral profesional */}
                <div className="relative w-full h-2 rounded bg-gray-200 overflow-hidden">
                    {/* Progress bar biru profesional untuk semua kondisi */}
                    <div
                        className={`absolute h-2 left-0 top-0 rounded ${isComplete ? 'bg-sky-600' : 'bg-sky-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className={`text-xs font-semibold ${isComplete ? 'text-sky-700' : 'text-sky-600'}`}>{percent.toFixed(0)}%</span>
            </div>
        );
    };

    const isLocked = (indicator: Indicator) => indicator.value === 0 && indicator.target === 0;

    const fillMissingIndicators = () => {
        return indicatorTitles.map((title) => {
            const indicator = data.find((item) => item.title === title);
            return indicator || { title, value: 0, target: 0, bulan, tahun };
        });
    };

    const sortedBulanList = Object.entries(bulanMapping)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([key, label]) => ({ value: key, label }));

    return (
        <div className="w-full rounded-2xl bg-white p-5 border border-gray-200">
            <div className='flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6'>
                <div>
                    <div className="font-bold text-xl text-gray-800">Komunikasi</div>
                    <div className="text-md text-gray-600">Rekap 6 Indikator {bulanMapping[bulan]} - {tahun}</div>
                </div>
                <Select value={bulan} onValueChange={setBulan}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px]">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedBulanList.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {indicatorTitles.map((_, index) => (
                        <Card key={index} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                            <Skeleton className="h-8 w-full mt-auto" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fillMissingIndicators().map((indicator, index) => (
                        isLocked(indicator) ? (
                            <Card key={index} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
                                <div>
                                    <div className="font-bold text-lg text-gray-800">{indicator.title}</div>
                                    <div className="text-sm text-gray-500 mb-2">{bulanMapping[indicator.bulan]} - {indicator.tahun}</div>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm text-center mt-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Belum ada data</span>
                                </div>
                            </Card>
                        ) : (
                            <Card key={index} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
                                <div>
                                    <div className="font-bold text-lg text-gray-800">{indicator.title}</div>
                                    <div className="text-sm text-gray-500 mb-2">{bulanMapping[indicator.bulan]} - {indicator.tahun}</div>
                                </div>

                                {indicator.title === "Laporan Permintaan Publik" ? (
                                    <div className="absolute bottom-0 left-0 flex items-baseline gap-1 p-6">
                                        <span className="text-4xl font-extrabold text-gray-800">{indicator.value}</span>
                                        <span className="text-2xl font-bold text-gray-500">/ {indicator.target}</span>
                                    </div>
                                ) : indicator.title === "Share Berita Internal" ? (
                                    <></>
                                ) : (
                                    <div className="absolute right-6 top-6 flex items-end gap-1">
                                        <span className="text-5xl font-extrabold text-gray-800">{indicator.value?.toLocaleString()}</span>
                                        <span className="text-3xl font-bold text-gray-500">/ {indicator.target.toLocaleString()}</span>
                                    </div>
                                )}
                                {indicator.title === "Laporan Permintaan Publik" ? (
                                    <div className="flex flex-row-reverse items-end justify-between">
                                        <div className="flex flex-col items-end">
                                             {/* Ikon dengan warna profesional - hijau untuk sukses, orange untuk peringatan */}
                                            {indicator.value === 0 ? (
                                                <AlertCircle className="w-22 h-22 text-orange-500" strokeWidth={2.2} />
                                            ) : (
                                                <CheckCircle className="w-22 h-22 text-green-600" strokeWidth={2.2} />
                                            )}
                                        </div>
                                    </div>
                                ) : indicator.title === "Share Berita Internal" ? (
                                    <div className="flex flex-row-reverse items-end justify-between mt-auto">
                                        <div className="flex flex-col items-end">
                                            {/* Ikon dengan warna profesional */}
                                            {indicator.value >= indicator.target ? (
                                                <CheckCircle className="w-22 h-22 text-green-600" strokeWidth={2.2} />
                                            ) : (
                                                <AlertCircle className="w-22 h-22 text-orange-500" strokeWidth={2.2} />
                                            )}
                                        </div>
                                        {/* Teks status dengan warna profesional */}
                                        <div className={`text-base font-semibold ${indicator.value >= indicator.target ? 'text-green-700' : 'text-gray-700'}`}>
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