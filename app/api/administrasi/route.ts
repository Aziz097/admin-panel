import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define types for Administrasi, now including 'tjsl'
type AdministrasiType = 'komunikasi' | 'sertifikasi' | 'kepatuhan' | 'tjsl';

// Import Prisma model types, now including 'Tjsl'
import type { Komunikasi, Sertifikasi, Kepatuhan, tjsl } from '@prisma/client';
type AdministrasiItem = Komunikasi | Sertifikasi | Kepatuhan | tjsl;

// --- Validation Schemas ---

const komunikasiSchema = z.object({
    namaIndikator: z.string(),
    tahun: z.string(),
    bulan: z.string(),
    target: z.number().int(),
    realisasi: z.number().int(),
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
    realisasi: z.number().int(),
    tahun: z.string(),
    bulan: z.string(),
});

// **BARU**: Schema validasi untuk model TJSL
const tjslSchema = z.object({
    nama: z.string(),
    nip: z.string(),
    jabatan: z.string(),
    tahun: z.string(),
    bulan: z.string(),
    status: z.boolean(),
});


// --- Maps for models and schemas ---

const administrasiModelMap: Record<AdministrasiType, any> = {
    komunikasi: prisma.komunikasi,
    sertifikasi: prisma.sertifikasi,
    kepatuhan: prisma.kepatuhan,
    tjsl: prisma.tjsl, // **Ditambahkan**
};

const administrasiSchemaMap: Record<AdministrasiType, any> = {
    komunikasi: komunikasiSchema,
    sertifikasi: sertifikasiSchema,
    kepatuhan: kepatuhanSchema,
    tjsl: tjslSchema, // **Ditambahkan**
};

// --- API Handlers ---

// GET handler: Fetch administration data
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    const id = searchParams.get('id'); // Added to handle fetching single item for edit page

    if (!type || !(type in administrasiModelMap)) {
        return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
    }

    try {
        const model = administrasiModelMap[type];
        let data;

        if (id) {
            // Fetch a single item by ID
            data = await model.findMany({ where: { id: Number(id) } });
            if (!data || data.length === 0) {
                 return NextResponse.json({ message: "Data not found", error: `No ${type} found with id ${id}` }, { status: 404 });
            }
        } else {
            // Fetch multiple items (existing logic)
            data = await model.findMany();
        }

        // Return data with 'type' appended to each item
        return NextResponse.json(data.map((item: any) => ({ ...item, type })));
    } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// POST handler: Create single or batch administration records
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;

    if (!type || !(type in administrasiSchemaMap)) {
        return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const schema = administrasiSchemaMap[type];
        const model = administrasiModelMap[type];

        // Handle batch creation for generic arrays of objects
        if (Array.isArray(body)) {
            const validated = z.array(schema).parse(body);
            const created = await model.createMany({ data: validated, skipDuplicates: true });
            return NextResponse.json(created, { status: 201 });
        }

        // Handle single record creation
        const validated = schema.parse(body);
        const created = await model.create({ data: validated });
        return NextResponse.json(created, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }
        console.error(`Error creating ${type} record:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// PUT handler: Update an administration record by ID
export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    const id = searchParams.get('id');

    if (!type || !(type in administrasiSchemaMap) || !id) {
        return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const schema = administrasiSchemaMap[type];
        // Use full schema for PUT to ensure all fields are correct, not partial
        const validated = schema.parse(body); 
        const model = administrasiModelMap[type];

        const updated = await model.update({
            where: { id: Number(id) },
            data: validated,
        });

        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }
        console.error(`Error updating ${type} record:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// DELETE handler: Delete an administration record by ID
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdministrasiType;
    const id = searchParams.get('id');

    if (!type || !(type in administrasiModelMap) || !id) {
        return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    try {
        const model = administrasiModelMap[type];
        await model.delete({ where: { id: Number(id) } });
        return NextResponse.json({ message: `Deleted ${type} with id ${id}` });
    } catch (error) {
        console.error(`Error deleting ${type} record:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
