'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// ================== Types ==================
type Indicator = {
  title: string;
  value: number;
  target: number;
  bulan: string;
  tahun: string;
  status?: 'done' | 'pending';
};

// ================== Constants ==================
const indicatorTitles = [
  "Release Berita", "Konten Foto", "Akun Influencer Aktif",
  "Share Berita Internal", "Scoring Publikasi", "Laporan Permintaan Publik",
];

const bulanMapping: Record<string, string> = {
  "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
  "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
  "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
};

// ================== Data Fetch ==================
const fetchIndicatorData = async (bulan: string, tahun: string) => {
  const res = await fetch(`/api/administrasi?type=komunikasi&bulan=${bulan}&tahun=${tahun}`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

// ================== Helpers ==================
const getInitialMonth = (tahun: string) => {
  const now = new Date();
  // If the current year is selected, default to the current month
  if (tahun === String(now.getFullYear())) {
    return String(now.getMonth() + 1).padStart(2, '0');
  }
  // Otherwise, default to January
  return "01";
};

// ================== Component ==================
export function KomunikasiCards({ tahun }: { tahun: string }) {
  const [bulan, setBulan] = useState(() => getInitialMonth(tahun));
  const [data, setData] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiData = await fetchIndicatorData(bulan, tahun);
        const mappedData = apiData.map((item: any) => ({
          title: item.namaIndikator,
          value: item.realisasi ?? 0,
          target: item.target || 0,
          bulan: item.bulan,
          tahun: item.tahun,
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

  // ================== Render Helpers ==================
  const isLocked = (indicator: Indicator) => indicator.value === 0 && indicator.target === 0;

  const fillMissingIndicators = (): Indicator[] =>
    indicatorTitles.map((title) =>
      data.find((item) => item.title === title) || { title, value: 0, target: 0, bulan, tahun }
    );

  const renderProgressBar = (value: number, target: number) => {
    const percent = target > 0 ? (value / target) * 100 : 0;
    const isComplete = percent >= 100;
    return (
      <div className="flex items-center gap-2 mt-8">
        <div className="relative w-full h-2 rounded bg-gray-200 overflow-hidden">
          <div
            className={`absolute h-2 left-0 top-0 rounded ${isComplete ? 'bg-sky-500' : 'bg-sky-400'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${isComplete ? 'text-sky-500' : 'text-sky-400'}`}>
          {percent.toFixed(0)}%
        </span>
      </div>
    );
  };

  const sortedBulanList = Object.entries(bulanMapping)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([value, label]) => ({ value, label }));

  // ================== Render ==================
  return (
    <div className="w-full rounded-2xl bg-white p-5 border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
        <div>
          <div className="font-bold text-xl text-gray-800">Komunikasi</div>
          <div className="text-md text-gray-600">Rekap 6 Indikator {bulanMapping[bulan]} - {tahun}</div>
        </div>
        <Select value={bulan} onValueChange={setBulan}>
          <SelectTrigger className="h-9 w-full sm:w-[140px]">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent>
            {sortedBulanList.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicatorTitles.map((_, i) => (
            <Card key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none flex flex-col justify-between min-h-[190px]">
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
              <Card key={index} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none flex flex-col justify-between min-h-[190px]">
                <div>
                  <div className="font-bold text-lg text-gray-800">{indicator.title}</div>
                  <div className="text-sm text-gray-500 mb-2">{bulanMapping[indicator.bulan]} - {indicator.tahun}</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm text-center mt-auto">
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

                {/* Conditional Value Display */}
                {(() => {
                  if (indicator.title === "Scoring Publikasi") {
                    return (
                      <div className="absolute right-6 top-6 flex flex-col items-end text-right">
                        <span className="text-2xl font-extrabold text-gray-800">{indicator.value.toLocaleString()}</span>
                        <span className="text-lg font-bold text-gray-500">/ {indicator.target.toLocaleString()}</span>
                      </div>
                    );
                  }
                  if (indicator.title === "Laporan Permintaan Publik") {
                    return (
                      <div className="absolute bottom-0 left-0 flex items-baseline gap-1 p-6">
                        <span className="text-4xl font-extrabold text-gray-800">{indicator.value}</span>
                        <span className="text-2xl font-bold text-gray-500">/ {indicator.target}</span>
                      </div>
                    );
                  }
                  if (indicator.title === "Share Berita Internal") {
                    return null; // Value is shown in status text
                  }
                  return (
                    <div className="absolute right-6 top-6 flex items-end gap-1">
                      <span className="text-5xl font-extrabold text-gray-800">{indicator.value.toLocaleString()}</span>
                      <span className="text-3xl font-bold text-gray-500">/ {indicator.target.toLocaleString()}</span>
                    </div>
                  );
                })()}

                {/* Conditional Status / Progress Bar */}
                {(() => {
                  if (indicator.title === "Laporan Permintaan Publik") {
                    return (
                      <div className="flex flex-row-reverse items-end justify-between">
                        <div className="flex flex-col items-end">
                          {indicator.value === 0
                            ? <AlertCircle className="w-22 h-22 text-orange-500" strokeWidth={2.2} />
                            : <CheckCircle className="w-22 h-22 text-green-600" strokeWidth={2.2} />}
                        </div>
                      </div>
                    );
                  }
                  if (indicator.title === "Share Berita Internal") {
                    const isComplete = indicator.value >= indicator.target;
                    return (
                      <div className="flex flex-row-reverse items-end justify-between mt-auto">
                        <div className="flex flex-col items-end">
                          {isComplete
                            ? <CheckCircle className="w-22 h-22 text-green-600" strokeWidth={2.2} />
                            : <AlertCircle className="w-22 h-22 text-orange-500" strokeWidth={2.2} />}
                        </div>
                        <div className={`text-base font-semibold ${isComplete ? 'text-green-700' : 'text-gray-700'}`}>
                          {isComplete ? 'Sudah Dishare!' : 'Belum Dishare!'}
                        </div>
                      </div>
                    );
                  }
                  // Default to progress bar
                  return renderProgressBar(indicator.value, indicator.target);
                })()}
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}