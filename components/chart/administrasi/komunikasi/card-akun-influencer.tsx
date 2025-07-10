'use client';
import { Card } from '@/components/ui/card';
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from 'recharts';

export function CardAkunInfluencer({
    value = 1,
    target = 4,
    bulan = 'Juni',
    tahun = '2024',
}: {
    value?: number;
    target?: number;
    bulan?: string;
    tahun?: string;
}) {
    const percent = (value / target) * 100;
    const chartData = [{ name: 'Akun', Target: 100, Realisasi: percent }];

    return (
        <Card className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-none flex flex-col justify-between min-h-[190px] relative">
            <div>
                <div className="font-bold text-lg text-black">Akun Influencer Aktif</div>
                <div className="text-sm text-zinc-500 mb-2">
                    {bulan} - {tahun}
                </div>
            </div>
            <div className="absolute right-6 top-6 flex items-end gap-1">
                <span className="text-5xl font-extrabold text-black">{value}</span>
                <span className="text-3xl font-bold text-zinc-400">/ {target}</span>
            </div>
            <div className="flex items-center gap-2 mt-8">
                <div className="relative w-full h-2 rounded bg-zinc-200 overflow-hidden">
                    <div
                        className="absolute h-2 left-0 top-0 bg-black rounded"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className="text-xs text-black font-semibold">{percent}%</span>
            </div>
        </Card>
    );
}