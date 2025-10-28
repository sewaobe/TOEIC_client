import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  listeningData: { part: string; accuracy: number }[];
  readingData: { part: string; accuracy: number }[];
}

// ✅ Custom Tooltip loại bỏ giá trị 0%
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const listening = payload.find((p: any) => p.dataKey === "Listening");
  const reading = payload.find((p: any) => p.dataKey === "Reading");

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: "8px 12px",
      }}
    >
      <strong>{label}</strong>
      <div style={{ marginTop: 4 }}>
        {listening && listening.value > 0 && (
          <div>
            <span style={{ color: "#7C3AED", fontWeight: 600 }}>Listening:</span>{" "}
            {(listening.value * 100).toFixed(1)}%
          </div>
        )}
        {reading && reading.value > 0 && (
          <div>
            <span style={{ color: "#3B82F6", fontWeight: 600 }}>Reading:</span>{" "}
            {(reading.value * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

const AccuracyComparisonChart: React.FC<Props> = ({ listeningData, readingData }) => {
  // ✅ Gộp theo part — mỗi part có cả Listening & Reading
  const allParts = Array.from(
    new Set([...listeningData.map((d) => d.part), ...readingData.map((d) => d.part)])
  );

  const data = allParts.map((part) => {
    const listening = listeningData.find((d) => d.part === part)?.accuracy || 0;
    const reading = readingData.find((d) => d.part === part)?.accuracy || 0;
    return { part, Listening: listening, Reading: reading };
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barGap={6} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="part" />
        <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <Tooltip content={<CustomTooltip />} /> {/* ✅ Custom tooltip */}
        <Legend />
        <Bar dataKey="Listening" fill="url(#colorListening)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Reading" fill="url(#colorReading)" radius={[6, 6, 0, 0]} />

        {/* Gradient màu */}
        <defs>
          <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AccuracyComparisonChart;
