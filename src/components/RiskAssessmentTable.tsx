
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
    console.log('Editing assessment:', assessment);
    setEditingAssessment(assessment);
  };

  const handleEditSubmit = async (data: Omit<RiskAssessment, "id" | "createdAt">) => {
    if (!editingAssessment) {
      console.error('No editing assessment found');
      return;
    }

    console.log('Submitting updated data:', data);
    console.log('Original assessment:', editingAssessment);

    try {
      const updateData = {
        service_id: data.serviceId,
        risk_category: data.riskCategory,
        risk_description: data.riskDescription,
        data_interface: data.dataInterface || 'Not applicable',
        data_location: data.dataLocation || 'Not applicable',
        likelihood_per_year: data.likelihoodPerYear || 1,
        risk_level: data.riskLevel || 'low',
        mitigation: data.mitigation || '',
        data_classification: data.dataClassification || 'Internal',
        risk_owner: data.riskOwner,
        revenue_impact: data.revenueImpact || 'unclear',
        has_global_revenue_impact: data.hasGlobalRevenueImpact || false,
        global_revenue_impact_hours: data.globalRevenueImpactHours,
        has_local_revenue_impact: data.hasLocalRevenueImpact || false,
        local_revenue_impact_hours: data.localRevenueImpactHours,
        pi_data_at_risk: data.piDataAtRisk || 'no',
        pi_data_amount: data.piDataAmount,
        hours_to_remediate: data.hoursToRemediate,
        additional_loss_event_costs: data.additionalLossEventCosts
      };

      console.log('Sending update with data:', updateData);

      const { data: updatedData, error } = await supabase
        .from('risk_assessments')
        .update(updateData)
        .eq('id', editingAssessment.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', updatedData);

      await queryClient.invalidateQueries({ queryKey: ['riskAssessments'] });
      
      toast({
        title: "Success",
        description: "Risk assessment updated successfully",
      });

      setEditingAssessment(null);
    } catch (error) {
      console.error('Error updating risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to update risk assessment. Please check the console for details.",
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
