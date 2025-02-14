
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RiskAssessment } from '@/types/risk';

interface DataClassificationDistributionProps {
  assessments: RiskAssessment[];
}

const DataClassificationDistribution = ({ assessments }: DataClassificationDistributionProps) => {
  const distribution = assessments.reduce((acc, assessment) => {
    acc[assessment.dataClassification] = (acc[assessment.dataClassification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(distribution).map(([classification, count]) => ({
    classification,
    count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="classification" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Number of Risks" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DataClassificationDistribution;
