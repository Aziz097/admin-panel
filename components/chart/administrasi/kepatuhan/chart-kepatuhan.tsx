'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';

// 1. Data mentah yang baru disertakan di sini
const rawData = {
    '06': [
        { indikator: 'Dokumen A', kategori: 'Pemenuhan', eviden: 3, patuh: 3 },
        { indikator: 'Dokumen B', kategori: 'Kualitas', eviden: 2, patuh: 1 },
        { indikator: 'Dokumen C', kategori: 'Pemenuhan', eviden: 2, patuh: 2 },
        { indikator: 'Dokumen D', kategori: 'Kualitas', eviden: 1, patuh: 1 },
        { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 3 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 1 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 2 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
    { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 3 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 1 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 2 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
    { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 3 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 1 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 2 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
    ],
    '07': [
        { indikator: 'Dokumen A', kategori: 'Pemenuhan', eviden: 3, patuh: 2 },
        { indikator: 'Dokumen B', kategori: 'Kualitas', eviden: 2, patuh: 2 },
        { indikator: 'Dokumen C', kategori: 'Pemenuhan', eviden: 2, patuh: 1 },
        { indikator: 'Dokumen D', kategori: 'Kualitas', eviden: 1, patuh: 1 },
    ],
};

const chartConfig: ChartConfig = {
    realisasi: {
        label: 'Realisasi',
        color: 'black',
    },
    sisa: {
        label: 'Sisa Target',
        color: 'rgba(0, 0, 0, 0.3)',
    },
};

function formatPersen(value: number) {
    return `${value.toFixed(0)}`;
}

export function ChartBarStackedKepatuhan({ bulan = '06' }: { bulan?: string }) {
    // 2. Logika useMemo disesuaikan untuk mengolah rawData
    const chartData = useMemo(() => {
        const dataBulanan = rawData[bulan] || [];
        return dataBulanan.map((item) => {
            return {
                indikator: item.indikator,
                target: item.eviden,
                realisasi: item.patuh,
                sisa: item.eviden - item.patuh,
            };
        });
    }, [bulan]);

    return (
        <Card className="rounded-2xl border border-zinc-200 bg-white shadow-none px-4 py-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Capaian Kepatuhan Indikator</CardTitle>
                <CardDescription className="text-sm text-zinc-500">Bulan {bulan}</CardDescription>
            </CardHeader>
            <CardContent className="h-[270px]">
                <ChartContainer config={chartConfig} className="h-full w-full relative">
                    <BarChart accessibilityLayer data={chartData} barCategoryGap={'20%'}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="indikator"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ payload, label }) => {
                                if (!payload?.length) return null;
                                const current = chartData.find((d) => d.indikator === label);
                                if (!current) return null;

                                return (
                                    <div className="rounded-xl p-3 shadow-xl min-w-[170px] space-y-1 bg-white text-black border border-zinc-100">
                                        <div className="font-semibold text-base mb-1">
                                            {current.indikator}
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
            </CardContent>
            <CardFooter className="justify-center gap-6 pt-4 pb-2 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: chartConfig.realisasi.color }}
                    />
                    <span className="leading-none">Realisasi</span>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: chartConfig.sisa.color }}
                    />
                    <span className="leading-none">Target</span>
                </div>
            </CardFooter>
        </Card>
    );
}