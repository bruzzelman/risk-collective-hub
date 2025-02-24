
import RiskAssessmentTable from "@/components/RiskAssessmentTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import { RiskAssessment, RevenueImpact } from "@/types/risk";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ServicesManagement from "./ServicesManagement";
import DataClassificationDistribution from "@/components/charts/DataClassificationDistribution";
import RiskLevelDistribution from "@/components/charts/RiskLevelDistribution";
import RiskCategoryDistribution from "@/components/charts/RiskCategoryDistribution";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const IndexPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);

  // Template risks data
  const templateRisks = [
    {
      name: "Payment Processing Failure",
      category: "Error",
      description: "Critical failure in the payment processing system",
      lossEventCategory: "Business Disruption and System Failures"
    },
    {
      name: "Data Breach",
      category: "Malicious",
      description: "Unauthorized access to sensitive customer data",
      lossEventCategory: "External Fraud"
    },
    {
      name: "System Downtime",
      category: "Failure",
      description: "Unplanned system outage affecting service availability",
      lossEventCategory: "Business Disruption and System Failures"
    },
    {
      name: "Process Error",
      category: "Error",
      description: "Manual process execution error",
      lossEventCategory: "Execution, Delivery & Process Management"
    },
    {
      name: "Internal Fraud",
      category: "Malicious",
      description: "Intentional misuse of system access by employees",
      lossEventCategory: "Internal Fraud"
    }
  ];

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
        revenueImpact: assessment.revenue_impact as RevenueImpact,
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

  if (!data || error) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assessments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
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

            <TabsContent value="reporting">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Level Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RiskLevelDistribution assessments={assessments} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Classification Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataClassificationDistribution assessments={assessments} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RiskCategoryDistribution assessments={assessments} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Loss Event Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templateRisks.map((risk, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{risk.name}</TableCell>
                          <TableCell>{risk.category}</TableCell>
                          <TableCell>{risk.description}</TableCell>
                          <TableCell>{risk.lossEventCategory}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndexPage;

