// lib/mockData.ts

// ======= DIVISIONS & KPI DATA =======
export interface Division {
  id: number;
  name: string;
}

export interface KpiDataItem {
  id: number;
  divisionId: number;
  divisionName: string;
  metricName: string;
  value: number;
  unit: string;
  periodMonth: number;  // 1–12
  periodYear: number;   // e.g. 2025
  day: number;          // for completeness if you need Date()
}

export const divisions: Division[] = [
  { id: 1, name: "Keuangan & Akuntansi" },
  { id: 2, name: "Administrasi & Umum" },
  { id: 3, name: "Administrasi SDM" },
  { id: 4, name: "Administrasi Pengelolaan" },
  { id: 5, name: "Pelaksana Pengelolaan" },
];

// sample KPI data for May, June, July
export const kpiData: KpiDataItem[] = [
  // Mei 2025
  { id: 101, divisionId: 1, divisionName: "Keuangan & Akuntansi", metricName: "Invoice Dibayar", value: 100, unit: "unit", periodMonth: 5, periodYear: 2025, day: 8 },
  { id: 102, divisionId: 2, divisionName: "Administrasi & Umum",  metricName: "Dokumen Diarsipkan", value: 180, unit: "unit", periodMonth: 5, periodYear: 2025, day:12 },
  // Juni 2025
  { id:   1, divisionId: 1, divisionName: "Keuangan & Akuntansi", metricName: "Invoice Dibayar", value: 120, unit: "unit", periodMonth: 6, periodYear: 2025, day: 3 },
  { id:   2, divisionId: 1, divisionName: "Keuangan & Akuntansi", metricName: "Waktu Pembayaran", value:  2.8, unit: "hari", periodMonth: 6, periodYear: 2025, day:10 },
  { id:   3, divisionId: 1, divisionName: "Keuangan & Akuntansi", metricName: "Tepat Waktu %",    value: 94, unit: "%", periodMonth: 6, periodYear: 2025, day:17 },
  { id:   4, divisionId: 2, divisionName: "Administrasi & Umum",  metricName: "Dokumen Diarsipkan", value:200, unit:"unit", periodMonth:6, periodYear:2025, day:5 },
  { id:   5, divisionId: 2, divisionName: "Administrasi & Umum",  metricName: "Proses Surat Hari",   value:3.5, unit:"hari", periodMonth:6, periodYear:2025, day:12 },
  { id:   6, divisionId: 3, divisionName:"Administrasi SDM",      metricName: "Karyawan Ditangani",  value:50, unit:"unit", periodMonth:6, periodYear:2025, day:8 },
  { id:   7, divisionId: 3, divisionName:"Administrasi SDM",      metricName: "Absensi %",           value:4.2, unit:"%", periodMonth:6, periodYear:2025, day:18 },
  { id:   8, divisionId: 4, divisionName:"Administrasi Pengelolaan", metricName:"Proyek Terlaksana", value:8, unit:"unit", periodMonth:6, periodYear:2025, day:2 },
  { id:   9, divisionId: 4, divisionName:"Administrasi Pengelolaan", metricName:"Proyek Tepat Waktu %", value:75, unit:"%", periodMonth:6, periodYear:2025, day:22 },
  { id:  10, divisionId: 5, divisionName:"Pelaksana Pengelolaan",  metricName:"Tugas/Kegiatan",     value:120, unit:"unit", periodMonth:6, periodYear:2025, day:1 },
  { id:  11, divisionId: 5, divisionName:"Pelaksana Pengelolaan",  metricName:"Waktu Penyelesaian", value:5.2, unit:"jam/hari", periodMonth:6, periodYear:2025, day:15 },
  { id:  12, divisionId: 5, divisionName:"Pelaksana Pengelolaan",  metricName:"Kegiatan Selesai %", value:88, unit:"%", periodMonth:6, periodYear:2025, day:28 },
  // Juli 2025
  { id: 201, divisionId:1, divisionName:"Keuangan & Akuntansi", metricName:"Invoice Dibayar", value:140, unit:"unit", periodMonth:7, periodYear:2025, day:6 },
  { id: 202, divisionId:2, divisionName:"Administrasi & Umum",  metricName:"Dokumen Diarsipkan", value:210, unit:"unit", periodMonth:7, periodYear:2025, day:14 },
  { id: 203, divisionId:3, divisionName:"Administrasi SDM",      metricName:"Karyawan Ditangani", value:55,  unit:"unit", periodMonth:7, periodYear:2025, day:10 },
];


// ======= FILE UPLOAD =======
export interface UploadedFileItem {
  id: number;
  originalName: string;
  month: number;
  year: number;
  uploadedAt: string;  // ISO string
}

// initial dummy
export let uploadedFiles: UploadedFileItem[] = [
  { id: 1, originalName: "data-juni-2025.xlsx", month: 6, year: 2025, uploadedAt: new Date("2025-06-05T09:30:00").toISOString() },
  { id: 2, originalName: "data-mei-2025.csv",   month: 5, year: 2025, uploadedAt: new Date("2025-05-02T10:15:00").toISOString() },
];

let nextFileId = 3;

// add new
export function addUploadedFile(file: Omit<UploadedFileItem, "id" | "uploadedAt">) {
  const newItem: UploadedFileItem = {
    id: nextFileId++,
    originalName: file.originalName,
    month: file.month,
    year: file.year,
    uploadedAt: new Date().toISOString(),
  };
  uploadedFiles = [newItem, ...uploadedFiles];
  return newItem;
}

// remove by id
export function removeUploadedFile(id: number) {
  uploadedFiles = uploadedFiles.filter((f) => f.id !== id);
}

// replace existing id
export function replaceUploadedFile(
  id: number,
  file: Omit<UploadedFileItem, "id" | "uploadedAt">
) {
  uploadedFiles = uploadedFiles.map((f) =>
    f.id === id
      ? {
          id,
          originalName: file.originalName,
          month: file.month,
          year: file.year,
          uploadedAt: new Date().toISOString(),
        }
      : f
  );
}
