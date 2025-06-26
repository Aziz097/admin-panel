// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "KPI Dashboard",
  description: "Dashboard KPI Departemen Keuangan & Administrasi",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
