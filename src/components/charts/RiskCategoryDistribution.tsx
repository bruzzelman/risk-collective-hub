
import { RiskAssessment } from "@/types/risk";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  assessments: RiskAssessment[];
}

const RiskCategoryDistribution = ({ assessments }: Props) => {
  const categoryCount = assessments.reduce((acc, curr) => {
    acc[curr.riskCategory] = (acc[curr.riskCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }));

  if (data.length === 0) return <div>No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={70} 
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#73D700" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RiskCategoryDistribution;
