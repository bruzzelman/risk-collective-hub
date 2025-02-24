
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
        impact: assessment.impact,
        mitigation: assessment.mitigation,
        dataClassification: assessment.data_classification,
        riskOwner: assessment.risk_owner,
        createdAt: new Date(assessment.created_at),
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
    // Here you would typically handle the form submission, e.g., sending the data to an API
    console.log("Form submitted with data:", data);

    // Optimistically update the assessments state
    setAssessments((prevAssessments) => [
      ...prevAssessments,
      {
        ...data,
        id: Math.random().toString(), // Temporary ID
        createdAt: new Date(),
      } as RiskAssessment,
    ]);

    // Close the form
    setIsFormOpen(false);

    // Show a success toast
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
