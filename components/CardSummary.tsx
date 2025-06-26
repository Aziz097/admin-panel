// app/components/CardSummary.tsx
import React from "react";

interface Props {
  title: string;
  value: number;
  unit?: string;
  /** index mulai dari 0, dipakai untuk memilih gradasi */
  colorIndex?: number;
}

const gradients = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-pink-400 to-pink-600",
  "from-yellow-400 to-yellow-600",
];

const CardSummary: React.FC<Props> = ({
  title,
  value,
  unit,
  colorIndex = 0,
}) => {
  const grad = gradients[colorIndex % gradients.length];

  return (
    <div
      className={`
        bg-gradient-to-r ${grad}
        text-white
        rounded-xl shadow
        p-4 flex flex-col justify-center
        h-32
      `}
    >
      <p className="text-sm opacity-75">{title}</p>
      <h3 className="text-3xl font-bold mt-2">
        {value.toLocaleString()} {unit || ""}
      </h3>
    </div>
  );
};

export default CardSummary;
