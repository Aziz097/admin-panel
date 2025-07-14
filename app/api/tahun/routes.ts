import { NextResponse } from "next/server";
// Menggunakan import yang sesuai dengan proyek Anda
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/tahun:
 * get:
 * summary: Fetches all unique years from the database
 * description: Retrieves a sorted list of unique years from multiple tables.
 * responses:
 * 200:
 * description: A list of unique years.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: string
 * example: "2024"
 * 500:
 * description: Internal server error.
 */
export async function GET() {
  try {
    // Menjalankan semua query secara bersamaan menggunakan 'prisma'
    const [
      attbTahun,
      aoTahun,
      akiTahun,
      optimasiTahun,
      kepatuhanTahun,
      komunikasiTahun,
      sertifikasiTahun,
      tjslTahun,
      ocrTahun,
    ] = await Promise.all([
      prisma.attb.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.ao.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.aki.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.optimasi.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.kepatuhan.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.komunikasi.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.sertifikasi.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.tjsl.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
      prisma.ocr.findMany({ select: { tahun: true }, distinct: ["tahun"] }),
    ]);

    // Gabungkan semua hasil menjadi satu array string
    const semuaTahun = [
      ...attbTahun.map(item => item.tahun),
      ...aoTahun.map(item => item.tahun),
      ...akiTahun.map(item => item.tahun),
      ...optimasiTahun.map(item => item.tahun),
      ...kepatuhanTahun.map(item => item.tahun),
      ...komunikasiTahun.map(item => item.tahun),
      ...sertifikasiTahun.map(item => item.tahun),
      ...tjslTahun.map(item => item.tahun),
      ...ocrTahun.map(item => item.tahun),
    ];

    // Hapus duplikat dan urutkan dari terbaru ke terlama
    const tahunUnik = [...new Set(semuaTahun)];
    tahunUnik.sort((a, b) => b.localeCompare(a));

    return NextResponse.json(tahunUnik);

  } catch (error) {
    console.error("Error fetching 'tahun' data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}