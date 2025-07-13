import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// --- Type Definitions ---
type AdministrasiType = 'komunikasi' | 'sertifikasi' | 'kepatuhan' | 'tjsl' | 'ocr';

import type { Komunikasi, Sertifikasi, Kepatuhan, tjsl, ocr } from '@prisma/client';
type AdministrasiItem = Komunikasi | Sertifikasi | Kepatuhan | tjsl | ocr;

// --- Validation Schemas ---
const komunikasiSchema = z.object({
    namaIndikator: z.string(),
    tahun: z.string(),
    bulan: z.string(),
    target: z.number().int(),
    realisasi: z.number().int().optional(),
});
const sertifikasiSchema = z.object({
    nomor: z.string(),
    nama: z.string(),
    status: z.string(),
    keterangan: z.string(),
    tahun: z.string(),
    bulan: z.string(),
});
const kepatuhanSchema = z.object({
    indikator: z.string(),
    kategori: z.string(),
    target: z.number().int(),
    realisasi: z.number().int().optional(),
    tahun: z.string(),
    bulan: z.string(),
    keterangan: z.string().optional(),
});
const ocrSchema = z.object({
    tahun: z.string(),
    semester: z.string(),
    target: z.number().int(),
    realisasi: z.number().int().optional(),
    kategoriOCR: z.string(),
});

// --- Maps for models and schemas ---
const administrasiModelMap: Record<Exclude<AdministrasiType, 'tjsl'>, any> = {
    komunikasi: prisma.komunikasi,
    sertifikasi: prisma.sertifikasi,
    kepatuhan: prisma.kepatuhan,
    ocr: prisma.ocr,
};
const administrasiSchemaMap: Record<Exclude<AdministrasiType, 'tjsl'>, any> = {
    komunikasi: komunikasiSchema,
    sertifikasi: sertifikasiSchema,
    kepatuhan: kepatuhanSchema,
    ocr: ocrSchema,
};

// --- API Handlers ---

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    const id = searchParams.get('id');

    if (!type) {
        return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }

    try {
        if (type === 'tjsl') {
            const tahun = searchParams.get('tahun');
            const semester = searchParams.get('semester');
            const bulan = searchParams.get('bulan');
            const includePegawai = {
                Pegawai: {
                    select: { nama: true, nip: true, jabatan: true },
                },
            };

            const whereClause: any = {};
            if (tahun) whereClause.tahun = tahun;
            if (semester) whereClause.semester = semester;
            if (bulan) whereClause.bulan = bulan;

            if (tahun || semester || bulan) {
                const data = await prisma.tjsl.findMany({
                    where: whereClause,
                    include: includePegawai,
                });
                return NextResponse.json(data);
            } else {
                const allTjslData = await prisma.tjsl.findMany({
                    select: { tahun: true },
                    distinct: ['tahun'],
                });
                return NextResponse.json(allTjslData);
            }
        }

        // Fallback for non-tjsl types
        const model = administrasiModelMap[type as Exclude<AdministrasiType, 'tjsl'>];
        if (!model) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        if (id) {
            const data = await model.findUnique({ where: { id: Number(id) } });
            if (!data) {
                return NextResponse.json({ message: "Data not found" }, { status: 404 });
            }
            return NextResponse.json(data);
        } else {
            const tahun = searchParams.get('tahun');
            const bulan = searchParams.get('bulan');
            const whereClause: any = {};

            if (tahun) whereClause.tahun = tahun;
            if (bulan) whereClause.bulan = bulan;

            const data = await model.findMany({ where: whereClause });
            return NextResponse.json(data);
        }

    } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    
    if (!type) {
        return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }

    try {
        if (type === 'tjsl') {
            const action = searchParams.get('action');
            if (action !== 'generate') {
                return NextResponse.json({ error: "Hanya action 'generate' yang didukung untuk POST tjsl" }, { status: 400 });
            }
            
            const body = await req.json();
            const { tahun, semester } = z.object({ tahun: z.string(), semester: z.string() }).parse(body);

            const allPegawai = await prisma.pegawai.findMany({
                select: { id: true }
            });

            if (allPegawai.length === 0) {
                 return NextResponse.json({ message: "Tidak ada pegawai untuk di-generate." }, { status: 200 });
            }

            const dataToCreate = allPegawai.map(p => ({
                pegawaiId: p.id,
                tahun,
                semester,
                status: false
            }));

            const result = await prisma.tjsl.createMany({
                data: dataToCreate,
                skipDuplicates: true,
            });

            return NextResponse.json({ message: `Berhasil generate data TJSL. ${result.count} record baru dibuat.`, ...result }, { status: 201 });
        }
        
        const schema = administrasiSchemaMap[type as Exclude<AdministrasiType, 'tjsl'>];
        const model = administrasiModelMap[type as Exclude<AdministrasiType, 'tjsl'>];

        if (!schema || !model) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const body = await req.json();
        if (Array.isArray(body)) {
            const validated = z.array(schema).parse(body);
            const created = await model.createMany({ data: validated, skipDuplicates: true });
            return NextResponse.json(created, { status: 201 });
        }

        const validated = schema.parse(body);
        const created = await model.create({ data: validated });
        return NextResponse.json(created, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error(`Error creating ${type} record:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    const id = searchParams.get('id');

    if (!type) {
        return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }
    
    try {
        if (type === 'tjsl') {
            const body = await req.json();
            const updateSchema = z.object({
                pegawaiId: z.number().int(),
                tahun: z.string(),
                semester: z.string(),
                status: z.boolean(),
            });
            const { pegawaiId, tahun, semester, status } = updateSchema.parse(body);

            const updated = await prisma.tjsl.update({
                where: {
                    pegawaiId_tahun_semester: {
                        pegawaiId,
                        tahun,
                        semester,
                    }
                },
                data: {
                    status: status,
                }
            });
            return NextResponse.json(updated);
        }
        
        if (!id) {
            return NextResponse.json({ error: 'Missing id for update' }, { status: 400 });
        }
        const schema = administrasiSchemaMap[type as Exclude<AdministrasiType, 'tjsl'>];
        const model = administrasiModelMap[type as Exclude<AdministrasiType, 'tjsl'>];

        if (!schema || !model) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }
        
        const body = await req.json();
        const validated = schema.parse(body);
        const updated = await model.update({
            where: { id: Number(id) },
            data: validated,
        });
        return NextResponse.json(updated);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error(`Error updating ${type} record:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    const id = searchParams.get('id');

    if (!type || !id) {
        return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    try {
        const model = type === 'tjsl' ? prisma.tjsl : administrasiModelMap[type as Exclude<AdministrasiType, 'tjsl'>];

        if (!model) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        await model.delete({ where: { id: Number(id) } });
        return NextResponse.json({ message: `Deleted ${type} with id ${id}` });
    } catch (error) {
        console.error(`Error deleting ${type} record:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
