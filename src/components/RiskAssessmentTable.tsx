
import {
  Table,
  TableBody,
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
import { RiskAssessment } from "@/types/risk";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useServiceDetails } from "@/hooks/useServiceDetails";
import RiskAssessmentTableRow from "./RiskAssessmentTableRow";
import RiskAssessmentEditDialog from "./RiskAssessmentEditDialog";

interface RiskAssessmentTableProps {
  assessments: RiskAssessment[];
}

const RiskAssessmentTable = ({ assessments }: RiskAssessmentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAssessment, setEditingAssessment] = useState<RiskAssessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getServiceDetails } = useServiceDetails();

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
          has_local_revenue_impact: data.hasLocalRevenueImpact,
          local_revenue_impact_hours: data.localRevenueImpactHours,
        })
        .eq('id', editingAssessment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment updated successfully",
      });

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
                  <TableHead>Risk Owner</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => {
                  const serviceDetails = getServiceDetails(assessment.serviceId);
                  return (
                    <RiskAssessmentTableRow
                      key={assessment.id}
                      assessment={assessment}
                      serviceName={serviceDetails.name}
                      divisionName={serviceDetails.division}
                      teamName={serviceDetails.team}
                      onEdit={handleEdit}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RiskAssessmentEditDialog
        assessment={editingAssessment}
        onClose={() => setEditingAssessment(null)}
        onSubmit={handleEditSubmit}
      />
    </>
  );
};

export default RiskAssessmentTable;
