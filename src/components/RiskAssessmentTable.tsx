
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
import { Button } from "@/components/ui/button";
import RiskLevelBadge from "./RiskLevelBadge";
import { RiskAssessment } from "@/types/risk";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface RiskAssessmentTableProps {
  assessments: RiskAssessment[];
}

const RiskAssessmentTable = ({ assessments }: RiskAssessmentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

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

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const getServiceDetails = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return { name: "Unknown Service", division: "Unknown Division", team: "Unknown Team" };

    const division = divisions.find(d => d.id === service.division_id);
    const team = teams.find(t => t.id === service.team_id);

    return {
      name: service.name,
      division: division?.name || "Unknown Division",
      team: team?.name || "Unknown Team"
    };
  };

  const handleEdit = (assessment: RiskAssessment) => {
    console.log("Edit assessment:", assessment);
    // TODO: Implement edit functionality
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const serviceDetails = getServiceDetails(assessment.serviceId);
    return (
      Object.values(assessment).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      serviceDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDetails.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDetails.team.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
                <TableHead>Team</TableHead>
                <TableHead>Loss event description</TableHead>
                <TableHead>Loss event category</TableHead>
                <TableHead>Data Interface</TableHead>
                <TableHead>Data Location</TableHead>
                <TableHead>Likelihood (%/year)</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Data Classification</TableHead>
                <TableHead>Risk Owner</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => {
                const serviceDetails = getServiceDetails(assessment.serviceId);
                return (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      {serviceDetails.name}
                    </TableCell>
                    <TableCell>{serviceDetails.division}</TableCell>
                    <TableCell>{serviceDetails.team}</TableCell>
                    <TableCell>{assessment.riskDescription}</TableCell>
                    <TableCell>{assessment.riskCategory}</TableCell>
                    <TableCell>{assessment.dataInterface}</TableCell>
                    <TableCell>{assessment.dataLocation}</TableCell>
                    <TableCell>{assessment.likelihoodPerYear}%</TableCell>
                    <TableCell>
                      <RiskLevelBadge level={assessment.riskLevel} />
                    </TableCell>
                    <TableCell>{assessment.dataClassification}</TableCell>
                    <TableCell>{assessment.riskOwner}</TableCell>
                    <TableCell>
                      {assessment.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(assessment)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentTable;
