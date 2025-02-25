
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import { RiskAssessment } from "@/types/risk";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ServicesManagement from "./ServicesManagement";
import TeamsManagement from "./TeamsManagement";
import { Rat } from "lucide-react";
import RiskAssessmentTable from "@/components/RiskAssessmentTable";
import StandardRisksTable from "@/components/risk/StandardRisksTable";
import RiskMetrics from "@/components/risk/RiskMetrics";
import { useRiskAssessments } from "@/hooks/useRiskAssessments";
import { standardRisks } from "@/data/standardRisks";

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

  const { data, error, refetch } = useRiskAssessments(user?.id);

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

  if (!data || error) {
    return null;
  }

  return (
    <div className="relative min-h-screen pb-32">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Rat className="h-8 w-8 text-flixbus-green" />
            <CardTitle>RAT - Risk Assessment Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="assessments" className="space-y-4">
              <TabsList>
                <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="reporting">Reporting</TabsTrigger>
                <TabsTrigger value="standard-risks">Standard Risks</TabsTrigger>
              </TabsList>

              <TabsContent value="assessments">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsFormOpen(true)}>Add Risk Assessment</Button>
                </div>

                {isFormOpen && (
                  <div className="mb-8">
                    <RiskAssessmentForm onSubmit={handleFormSubmit} />
                  </div>
                )}

                <RiskAssessmentTable assessments={assessments} />
              </TabsContent>

              <TabsContent value="services">
                <ServicesManagement />
              </TabsContent>

              <TabsContent value="teams">
                <TeamsManagement />
              </TabsContent>

              <TabsContent value="reporting">
                <RiskMetrics assessments={assessments} />
              </TabsContent>

              <TabsContent value="standard-risks">
                <StandardRisksTable risks={standardRisks} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <footer className="fixed bottom-0 left-0 w-full h-32 z-50">
        <div className="relative w-full h-full">
          <img 
            src="https://honeycomb-illustrations.hive.flixbus.com/7.0.1/flix-illustrations/svg/landscape-usa-flixbus-greyhound.svg"
            alt="Flixbus Landscape"
            className="w-full h-full object-cover opacity-20 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
