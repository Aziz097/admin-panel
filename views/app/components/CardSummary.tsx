// app/components/CardSummary.tsx
import React from "react";

interface Props {
  title: string;
  value: number;
  unit?: string;
}

const CardSummary: React.FC<Props> = ({ title, value, unit }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold">
        {value.toLocaleString()} {unit || ""}
      </h3>
    </div>
  );
};

export default CardSummary;
