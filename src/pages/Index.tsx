
import { useEffect } from "react";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import RiskAssessmentTable from "@/components/RiskAssessmentTable";
import Overview from "./Overview";
import { RiskAssessment } from "@/types/risk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: assessments = [], refetch } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching assessments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data.map((assessment): RiskAssessment => ({
        id: assessment.id,
        serviceName: assessment.service_name,
        serviceDescription: assessment.service_description,
        divisionId: assessment.division_id,
        riskCategory: assessment.risk_category,
        riskDescription: assessment.risk_description,
        riskLevel: assessment.risk_level as RiskAssessment['riskLevel'],
        impact: assessment.impact,
        mitigation: assessment.mitigation,
        dataClassification: assessment.data_classification,
        riskOwner: assessment.risk_owner,
        createdAt: new Date(assessment.created_at),
      }));
    },
  });

  const handleSubmit = async (data: Omit<RiskAssessment, "id" | "createdAt">) => {
    const { error } = await supabase
      .from('risk_assessments')
      .insert({
        service_name: data.serviceName,
        service_description: data.serviceDescription,
        division_id: data.divisionId,
        risk_category: data.riskCategory,
        risk_description: data.riskDescription,
        risk_level: data.riskLevel,
        impact: data.impact,
        mitigation: data.mitigation,
        data_classification: data.dataClassification,
        risk_owner: user?.email,
        created_by: user?.id,
      });

    if (error) {
      toast({
        title: "Error submitting assessment",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Risk assessment submitted successfully",
    });
    
    refetch();
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Risk Assessment Portal</h1>
        <Button onClick={() => navigate("/teams")} variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Manage Teams & Divisions
        </Button>
      </div>
      
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New Assessment</TabsTrigger>
          <TabsTrigger value="view">View Assessments</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-6">
          <RiskAssessmentForm onSubmit={handleSubmit} />
        </TabsContent>
        
        <TabsContent value="view">
          <RiskAssessmentTable assessments={assessments} />
        </TabsContent>

        <TabsContent value="overview">
          <Overview assessments={assessments} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
