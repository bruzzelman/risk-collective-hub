
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RiskAssessment, RiskLevel } from '@/types/risk';

interface RiskLevelDistributionProps {
  assessments: RiskAssessment[];
}

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e'
};

const RiskLevelDistribution = ({ assessments }: RiskLevelDistributionProps) => {
  const distribution = assessments.reduce((acc, assessment) => {
    acc[assessment.riskLevel] = (acc[assessment.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<RiskLevel, number>);

  const data = Object.entries(distribution).map(([level, count]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name.toLowerCase() as RiskLevel]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RiskLevelDistribution;
