'use client';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function CardLaporanPublik({
    value = 0,
    target = 1,
    bulan = 'Juni',
    tahun = '2024',
    done = true,
}: {
    value?: number;
    target?: number;
    bulan?: string;
    tahun?: string;
    done?: boolean;
}) {
    return (
        <Card className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-none flex flex-col min-h-[190px] relative">
            <div>
                <div className="font-bold text-lg text-black">Laporan Permintaan Publik</div>
                <div className="text-sm text-zinc-500 mb-2">
                    {bulan} - {tahun}
                </div>
            </div>
            <div className="flex flex-row-reverse items-end justify-between">
                <div className="flex flex-col items-end">
                    {done ? (
                        <CheckCircle className="w-22 h-22 text-black" strokeWidth={2.2} />
                    ) : (
                        <AlertCircle className="w-22 h-22 text-black" strokeWidth={2.2} />
                    )}
                </div>
                <div className="items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-black">{value}</span>
                    <span className="text-2xl font-bold text-zinc-400">/ {target}</span>
                </div>
            </div>
        </Card>
    );
}