import { useState } from "react";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import RiskAssessmentTable from "@/components/RiskAssessmentTable";
import { RiskAssessment } from "@/types/risk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);

  const handleSubmit = (data: RiskAssessment) => {
    setAssessments((prev) => [data, ...prev]);
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Assessment Portal</h1>
      
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New Assessment</TabsTrigger>
          <TabsTrigger value="view">View Assessments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-6">
          <RiskAssessmentForm onSubmit={handleSubmit} />
        </TabsContent>
        
        <TabsContent value="view">
          <RiskAssessmentTable assessments={assessments} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;