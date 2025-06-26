// app/admin/files/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import ModalUpload from "../../components/ModalUpload";
import {
  UploadedFileItem,
  uploadedFiles as initialFiles,
  addUploadedFile,
  removeUploadedFile,
  replaceUploadedFile,
} from "../../../lib/mockData";

export default function AdminFilesPage() {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [replaceId, setReplaceId] = useState<number | null>(null);

  useEffect(() => {
    setFiles(initialFiles);
  }, []);

  const refreshFiles = () => {
    setFiles([...initialFiles]);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) return;
    removeUploadedFile(id);
    refreshFiles();
  };

  const handleReplace = (id: number) => {
    setReplaceId(id);
    setShowUpload(true);
  };

  const handleUploadSuccess = (fileName: string, month: number, year: number) => {
    if (replaceId) {
      replaceUploadedFile(replaceId, { originalName: fileName, month, year });
      setReplaceId(null);
    } else {
      addUploadedFile({ originalName: fileName, month, year });
    }
    setShowUpload(false);
    refreshFiles();
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/admin/login";
  };

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Pengelolaan File KPI Bulanan</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <button
          onClick={() => {
            setReplaceId(null);
            setShowUpload(true);
          }}
          className="bg-green-600 text-white py-2 px-4 rounded mb-4 hover:bg-green-700"
        >
          Upload File Baru
        </button>

        {files.length === 0 ? (
          <p className="text-gray-500">Belum ada file yang diupload.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Nama File</th>
                  <th className="px-4 py-2">Bulan</th>
                  <th className="px-4 py-2">Tahun</th>
                  <th className="px-4 py-2">Tanggal Upload</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, idx) => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{f.originalName}</td>
                    <td className="px-4 py-2">{f.month}</td>
                    <td className="px-4 py-2">{f.year}</td>
                    <td className="px-4 py-2">
                      {new Date(f.uploadedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleReplace(f.id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showUpload && (
          <ModalUpload
            fileId={replaceId ?? undefined}
            onClose={() => {
              setShowUpload(false);
              setReplaceId(null);
            }}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
