import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define types
type KeuanganType = "attb" | "ao" | "aki" | "optimasi";

// Import Prisma model types
import type { attb, ao, aki, optimasi } from "@prisma/client";
type KeuanganItem = attb | ao | aki | optimasi;

// Validation schemas
const attbSchema = z.object({
  tahun: z.string(),
  semester: z.string(),
  target: z.number(),
  realisasi: z.number().optional(),
});

const aoSchema = attbSchema;

const akiSchema = z.object({
  tahun: z.string(),
  bulan: z.string(),
  target: z.number(),
  realisasi: z.number().optional(),
});

const optimasiSchema = z.object({
  tahun: z.string(),
  bulan: z.string(),
  kategori: z.string(),
  penetapan: z.number(),
  optimasi: z.number().optional(),
  realisasi: z.number().optional(),
});

// Maps
const modelMap: Record<KeuanganType, any> = {
  attb: prisma.attb,
  ao: prisma.ao,
  aki: prisma.aki,
  optimasi: prisma.optimasi,
};

const schemaMap: Record<KeuanganType, any> = {
  attb: attbSchema,
  ao: aoSchema,
  aki: akiSchema,
  optimasi: optimasiSchema,
};

// Helper to normalize BigInt before JSON response
function normalizeBigInt(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === "bigint" ? Number(value) : value,
    ])
  );
}

// GET
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as KeuanganType;
  const tahun = searchParams.get("tahun") || undefined;
  const id = searchParams.get("id");

  if (!type || !(type in modelMap)) {
    return NextResponse.json({ error: "Invalid or missing type" }, { status: 400 });
  }

  const model = modelMap[type];

  try {
    if (id) {
      const numericId = Number(id);
      if (isNaN(numericId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }

      const data = await model.findUnique({ where: { id: numericId } });
      if (!data) {
        return NextResponse.json({ error: `${type} entry not found` }, { status: 404 });
      }

      return NextResponse.json({ ...normalizeBigInt(data), type });
    }

    const data: KeuanganItem[] = await model.findMany({
      where: tahun ? { tahun } : undefined,
    });

    // Define month order for sorting (only for models that have bulan)
    const monthOrder = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Sort the data based on the 'bulan' if available (optimasi, aki, etc.)
    const sortedData = data.sort((a, b) => {
      if ('bulan' in a && 'bulan' in b) {
        return monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan);
      }
      return 0; // If no bulan property, leave the order as is
    });

    return NextResponse.json(
      sortedData.map((item) => ({ ...normalizeBigInt(item), type }))
    );
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



// POST
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as KeuanganType;

  if (!type || !(type in schemaMap)) {
    return NextResponse.json({ error: "Invalid or missing type" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const schema = schemaMap[type];
    const model = modelMap[type];

    if ((type === "aki" || type === "optimasi") && Array.isArray(body.bulan)) {
      const entries = body.bulan.map((bulan: string) => ({
        tahun: body.tahun,
        bulan,
        ...(type === "optimasi"
          ? {
              kategori: body.kategori,
              penetapan: body.penetapan,
              optimasi: body.optimasi ?? 0,
            }
          : {
              target: body.target,
            }),
        realisasi: body.realisasi ?? 0,
      }));

      const created = await model.createMany({ data: entries, skipDuplicates: true });
      return NextResponse.json({ message: `Created ${created.count} ${type} entries.` }, { status: 201 });
    }

    if ((type === "attb" || type === "ao") && Array.isArray(body.semester)) {
      const entries = body.semester.map((semester: string) => ({
        tahun: body.tahun,
        semester,
        target: body.target,
        realisasi: body.realisasi ?? 0,
      }));

      const created = await model.createMany({ data: entries, skipDuplicates: true });
      return NextResponse.json({ message: `Created ${created.count} ${type} entries.` }, { status: 201 });
    }

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
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error(`Error creating ${type} record:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as KeuanganType;
  const id = searchParams.get("id");

  if (!type || !(type in schemaMap) || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const schema = schemaMap[type];
    const validated = schema.partial().parse(body);
    const model = modelMap[type];

    const updated = await model.update({
      where: { id: Number(id) },
      data: validated,
    });

    return NextResponse.json(normalizeBigInt(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error(`Error updating ${type} record:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as KeuanganType;
  const id = searchParams.get("id");

  if (!type || !(type in modelMap) || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  try {
    const model = modelMap[type];
    await model.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: `Deleted ${type} with id ${id}` });
  } catch (error) {
    console.error(`Error deleting ${type} record:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}