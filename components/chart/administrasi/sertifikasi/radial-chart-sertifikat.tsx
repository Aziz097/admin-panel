'use client';
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from 'recharts';

export function RadialChartSertifikatTanah({
    value = 0,
    target = 4,
    bulan = '-',
    tahun = '2024',
}: {
    value?: number;
    target?: number;
    bulan?: string;
    tahun?: string;
}) {
    const percent = target > 0 ? Math.round((value / target) * 100) : 0;
    const chartData = [{ name: 'Sertifikat', Target: 100, Realisasi: percent }];
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="font-semibold text-base mb-2">Progress Sertifikasi</div>
            <RadialBarChart
                width={320}
                height={300}
                innerRadius={120}
                outerRadius={185}
                startAngle={180}
                endAngle={0}
                data={chartData}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                style={{ overflow: 'visible' }}>
                <PolarRadiusAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                    tickLine={false}>
                    <Label
                        position="insideBottom"
                        content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) - 10}
                                        textAnchor="middle"
                                        fontWeight={900}
                                        fontSize={40}
                                        fill="#222">
                                        {percent}%
                                    </text>
                                );
                            }
                            return null;
                        }}
                    />
                    <Label
                        position="insideBottom"
                        content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 32}
                                        textAnchor="middle"
                                        fontSize={16}
                                        fill="#222">
                                        <tspan fontWeight="bold">{value}</tspan> / {target}{' '}
                                        Sertifikat Selesai
                                    </text>
                                );
                            }
                            return null;
                        }}
                    />
                </PolarRadiusAxis>
                <RadialBar dataKey="Realisasi" fill="#0a0a0a" stackId="a" cornerRadius={3} />
                <RadialBar dataKey="Target" fill="#e5e7eb" stackId="a" cornerRadius={3} />
            </RadialBarChart>
        </div>
    );
}