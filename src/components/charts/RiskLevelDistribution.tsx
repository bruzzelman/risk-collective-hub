
import { RiskAssessment } from "@/types/risk";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  assessments: RiskAssessment[];
}

const COLORS = ["#73D700", "#FFB547", "#FF4842"];

const RiskLevelDistribution = ({ assessments }: Props) => {
  const data = [
    { name: "Low", value: assessments.filter(a => a.riskLevel === "low").length },
    { name: "Medium", value: assessments.filter(a => a.riskLevel === "medium").length },
    { name: "High", value: assessments.filter(a => a.riskLevel === "high").length },
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

export default RiskLevelDistribution;
