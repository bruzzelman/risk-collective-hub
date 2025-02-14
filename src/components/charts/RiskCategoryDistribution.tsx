
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RiskAssessment } from '@/types/risk';

interface RiskCategoryDistributionProps {
  assessments: RiskAssessment[];
}

const RiskCategoryDistribution = ({ assessments }: RiskCategoryDistributionProps) => {
  const distribution = assessments.reduce((acc, assessment) => {
    acc[assessment.riskCategory] = (acc[assessment.riskCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(distribution).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Number of Risks" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RiskCategoryDistribution;
