// app/components/TableKpi.tsx
import React from "react";
import { KpiDataItem } from "../lib/mockData";

interface Props {
  data: KpiDataItem[];
}

const TableKpi: React.FC<Props> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Divisi</th>
            <th className="px-4 py-2 text-left">Metrik</th>
            <th className="px-4 py-2 text-right">Nilai</th>
            <th className="px-4 py-2 text-left">Satuan</th>
            <th className="px-4 py-2 text-center">Periode</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{d.divisionName}</td>
              <td className="px-4 py-2">{d.metricName}</td>
              <td className="px-4 py-2 text-right">{d.value}</td>
              <td className="px-4 py-2">{d.unit}</td>
              <td className="px-4 py-2 text-center">
                {d.periodMonth}/{d.periodYear}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableKpi;
