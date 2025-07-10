'use client';
import { useState } from 'react';
import { KomunikasiCardWrapper } from './komunikasi/card-komunikasi-wrapper';
import { CardAkunInfluencer } from './komunikasi/card-akun-influencer';
import { CardKomunikasiInternal } from './komunikasi/card-komunikasi-internal';
import { CardKontenFoto } from './komunikasi/card-konten-foto';
import { CardLaporanPublik } from './komunikasi/card-laporan-publik';
import { CardRilisBerita } from './komunikasi/card-rilis-berita';
import { CardScoringPublikasi } from './komunikasi/card-scoring-publikasi';

// Data dummy (per bulan)
const rawData = {
    '06': { rilis: 1, foto: 1, influencer: 1, internal: 'pending', scoring: 1575000, laporan: 0 },
    '07': { rilis: 2, foto: 2, influencer: 3, internal: 'done', scoring: 2250000, laporan: 1 },
};
type KomunikasiData = {
    rilis: number;
    foto: number;
    influencer: number;
    internal: 'done' | 'pending';
    scoring: number;
    laporan: number;
};
const defaultData: KomunikasiData = {
    rilis: 0,
    foto: 0,
    influencer: 0,
    internal: 'pending',
    scoring: 0,
    laporan: 0,
};

const bulanList = [
    { label: 'Januari', value: '01' },
    { label: 'Februari', value: '02' },
    { label: 'Maret', value: '03' },
    { label: 'April', value: '04' },
    { label: 'Mei', value: '05' },
    { label: 'Juni', value: '06' },
    { label: 'Juli', value: '07' },
    { label: 'Agustus', value: '08' },
    { label: 'September', value: '09' },
    { label: 'Oktober', value: '10' },
    { label: 'November', value: '11' },
    { label: 'Desember', value: '12' },
];

export function SummaryKomunikasi() {
    const [bulan, setBulan] = useState('06');
    const data: KomunikasiData = rawData[bulan] ?? defaultData;
    const labelBulan = bulanList.find((b) => b.value === bulan)?.label ?? '-';

    return (
        <KomunikasiCardWrapper bulan={bulan} setBulan={setBulan}>
            <CardRilisBerita value={data.rilis} target={2} bulan={labelBulan} tahun="2024" />
            <CardKontenFoto value={data.foto} target={2} bulan={labelBulan} tahun="2024" />
            <CardAkunInfluencer
                value={data.influencer}
                target={4}
                bulan={labelBulan}
                tahun="2024"
            />
            <CardKomunikasiInternal status={data.internal} bulan={labelBulan} tahun="2024" />
            <CardScoringPublikasi
                value={data.scoring}
                target={2250000}
                bulan={labelBulan}
                tahun="2024"
            />
            <CardLaporanPublik
                value={data.laporan}
                target={1}
                bulan={labelBulan}
                tahun="2024"
                done={data.laporan >= 1}
            />
        </KomunikasiCardWrapper>
    );
}