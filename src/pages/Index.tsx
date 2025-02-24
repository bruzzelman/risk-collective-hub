
import RiskAssessmentTable from "@/components/RiskAssessmentTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import { RiskAssessment } from "@/types/risk";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const IndexPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const { data, error, refetch } = useQuery({
    queryKey: ['riskAssessments'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((assessment): RiskAssessment => ({
        id: assessment.id,
        serviceId: assessment.service_id,
        riskCategory: assessment.risk_category,
        riskDescription: assessment.risk_description,
        dataInterface: assessment.data_interface,
        dataLocation: assessment.data_location,
        likelihoodPerYear: Number(assessment.likelihood_per_year),
        riskLevel: assessment.risk_level as RiskAssessment['riskLevel'],
        mitigation: assessment.mitigation,
        dataClassification: assessment.data_classification,
        riskOwner: assessment.risk_owner,
        createdAt: new Date(assessment.created_at),
        divisionId: assessment.division_id,
        revenueImpact: assessment.revenue_impact,
        hasGlobalRevenueImpact: assessment.has_global_revenue_impact,
        globalRevenueImpactHours: assessment.global_revenue_impact_hours,
        hasLocalRevenueImpact: assessment.has_local_revenue_impact,
        localRevenueImpactHours: assessment.local_revenue_impact_hours,
        hoursToRemediate: assessment.hours_to_remediate,
        additionalLossEventCosts: assessment.additional_loss_event_costs,
      }));
    },
  });

  useEffect(() => {
    if (data) {
      setAssessments(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleFormSubmit = async (data: Omit<RiskAssessment, "id" | "createdAt">) => {
    console.log("Form submitted with data:", data);

    setAssessments((prevAssessments) => [
      ...prevAssessments,
      {
        ...data,
        id: Math.random().toString(),
        createdAt: new Date(),
      } as RiskAssessment,
    ]);

    setIsFormOpen(false);

    toast({
      title: "Success",
      description: "Risk assessment added successfully!",
    });
    refetch();
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsFormOpen(true)}>Add Risk Assessment</Button>
          </div>

          {isFormOpen && (
            <div className="mb-8">
              <RiskAssessmentForm onSubmit={handleFormSubmit} />
            </div>
          )}

          <RiskAssessmentTable assessments={assessments} />
        </CardContent>
      </Card>
    </div>
  );
};

export default IndexPage;
