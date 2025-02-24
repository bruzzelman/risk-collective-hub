
import { RiskAssessment } from "@/types/risk";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  assessments: RiskAssessment[];
}

const COLORS = ["#73D700", "#36B37E", "#00B8D9", "#6554C0"];

const DataClassificationDistribution = ({ assessments }: Props) => {
  const data = [
    { name: "Public", value: assessments.filter(a => a.dataClassification === "public").length },
    { name: "Internal", value: assessments.filter(a => a.dataClassification === "internal").length },
    { name: "Confidential", value: assessments.filter(a => a.dataClassification === "confidential").length },
    { name: "Restricted", value: assessments.filter(a => a.dataClassification === "restricted").length },
  ].filter(item => item.value > 0);

  if (data.length === 0) return <div>No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DataClassificationDistribution;
