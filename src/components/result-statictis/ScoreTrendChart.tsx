import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Props {
  data: { month: string; listening: number; reading: number }[];
}

const ScoreTrendChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="listening" stroke="#7C3AED" strokeWidth={3} />
      <Line type="monotone" dataKey="reading" stroke="#6366F1" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);

export default ScoreTrendChart;
