
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RiskLevelBadge from "./RiskLevelBadge";
import { RiskAssessment } from "@/types/risk";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RiskAssessmentTableProps {
  assessments: RiskAssessment[];
}

const RiskAssessmentTable = ({ assessments }: RiskAssessmentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const getDivisionName = (divisionId: string | undefined) => {
    if (!divisionId) return "N/A";
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : "Unknown";
  };

  const filteredAssessments = assessments.filter((assessment) =>
    Object.values(assessment).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Risk Assessments</CardTitle>
        <div className="mt-2">
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Risk Category</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Data Classification</TableHead>
                <TableHead>Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">
                    {assessment.serviceName}
                  </TableCell>
                  <TableCell>{getDivisionName(assessment.divisionId)}</TableCell>
                  <TableCell>{assessment.riskCategory}</TableCell>
                  <TableCell>
                    <RiskLevelBadge level={assessment.riskLevel} />
                  </TableCell>
                  <TableCell>{assessment.dataClassification}</TableCell>
                  <TableCell>
                    {assessment.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentTable;
