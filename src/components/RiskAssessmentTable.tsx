
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RiskLevelBadge from "./RiskLevelBadge";
import { RiskAssessment } from "@/types/risk";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import RiskAssessmentForm from "./RiskAssessmentForm";
import { useToast } from "@/components/ui/use-toast";

interface RiskAssessmentTableProps {
  assessments: RiskAssessment[];
}

const RiskAssessmentTable = ({ assessments }: RiskAssessmentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAssessment, setEditingAssessment] = useState<RiskAssessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    setEditingAssessment(assessment);
  };

  const handleEditSubmit = async (data: Omit<RiskAssessment, "id" | "createdAt">) => {
    if (!editingAssessment) return;

    try {
      const { error } = await supabase
        .from('risk_assessments')
        .update({
          service_id: data.serviceId,
          risk_category: data.riskCategory,
          risk_description: data.riskDescription,
          data_interface: data.dataInterface,
          data_location: data.dataLocation,
          likelihood_per_year: data.likelihoodPerYear,
          risk_level: data.riskLevel,
          mitigation: data.mitigation,
          data_classification: data.dataClassification,
          risk_owner: data.riskOwner,
          has_global_revenue_impact: data.hasGlobalRevenueImpact,
          global_revenue_impact_hours: data.globalRevenueImpactHours,
        })
        .eq('id', editingAssessment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment updated successfully",
      });

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['riskAssessments'] });
      setEditingAssessment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update risk assessment",
        variant: "destructive",
      });
    }
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
    <>
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

      <Dialog open={!!editingAssessment} onOpenChange={() => setEditingAssessment(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Risk Assessment</DialogTitle>
          </DialogHeader>
          {editingAssessment && (
            <RiskAssessmentForm
              onSubmit={handleEditSubmit}
              initialValues={{
                serviceId: editingAssessment.serviceId,
                riskCategory: editingAssessment.riskCategory,
                riskDescription: editingAssessment.riskDescription,
                dataInterface: editingAssessment.dataInterface,
                dataLocation: editingAssessment.dataLocation,
                likelihoodPerYear: editingAssessment.likelihoodPerYear,
                riskLevel: editingAssessment.riskLevel,
                mitigation: editingAssessment.mitigation,
                dataClassification: editingAssessment.dataClassification,
                riskOwner: editingAssessment.riskOwner,
                hasGlobalRevenueImpact: editingAssessment.hasGlobalRevenueImpact,
                globalRevenueImpactHours: editingAssessment.globalRevenueImpactHours,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RiskAssessmentTable;
