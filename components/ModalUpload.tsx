// app/components/ModalUpload.tsx
"use client";

import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onSuccess: (fileName: string, month: number, year: number) => void;
  fileId?: number; // jika ada, berarti mode REPLACE
}

const ModalUpload: React.FC<Props> = ({ onClose, onSuccess, fileId }) => {
  const [fileName, setFileName] = useState<string>("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      setError("Nama file wajib diisi.");
      return;
    }
    setError(null);
    onSuccess(fileName, month, year);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {fileId ? "Replace File KPI" : "Upload File KPI Baru"}
        </h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!fileId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Bulan</label>
                <select
                  className="mt-1 block w-full border rounded p-2"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Tahun</label>
                <select
                  className="mt-1 block w-full border rounded p-2"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Nama File (Dummy)</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="contoh: data-kpi-juni-2025.xlsx"
              className="mt-1 block w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {fileId ? "Replace" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUpload;
