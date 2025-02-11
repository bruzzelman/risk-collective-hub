
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RiskLevel, RISK_CATEGORIES, DATA_CLASSIFICATIONS, RiskAssessment } from "@/types/risk";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
}

const RiskAssessmentForm = ({ onSubmit }: RiskAssessmentFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [serviceInfo, setServiceInfo] = useState({
    serviceName: "",
    serviceDescription: "",
    divisionId: "",
    teamId: "",
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
    queryKey: ['teams', serviceInfo.divisionId],
    queryFn: async () => {
      if (!serviceInfo.divisionId) return [];
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('division_id', serviceInfo.divisionId);
      if (error) throw error;
      return data;
    },
    enabled: !!serviceInfo.divisionId,
  });

  const [risks, setRisks] = useState<any[]>([]);
  const [currentRisk, setCurrentRisk] = useState({
    riskCategory: "",
    riskDescription: "",
    riskLevel: "",
    impact: "",
    mitigation: "",
    dataClassification: "",
  });

  const handleServiceInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setServiceInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelectChange = (name: string, value: string) => {
    setServiceInfo((prev) => {
      // If changing division, reset team selection
      if (name === 'divisionId') {
        return { ...prev, [name]: value, teamId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleRiskChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentRisk((prev) => ({ ...prev, [name]: value }));
  };

  const handleRiskSelectChange = (name: string, value: string) => {
    setCurrentRisk((prev) => ({ ...prev, [name]: value }));
  };

  const addRisk = () => {
    if (Object.values(currentRisk).some((value) => !value)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all risk fields",
        variant: "destructive",
      });
      return;
    }

    setRisks((prev) => [...prev, { ...currentRisk }]);
    setCurrentRisk({
      riskCategory: "",
      riskDescription: "",
      riskLevel: "",
      impact: "",
      mitigation: "",
      dataClassification: "",
    });

    toast({
      title: "Success",
      description: "Risk added successfully",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(serviceInfo).some((value) => !value)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all service information fields",
        variant: "destructive",
      });
      return;
    }

    if (risks.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one risk",
        variant: "destructive",
      });
      return;
    }

    try {
      risks.forEach((risk) => {
        onSubmit({
          ...serviceInfo,
          ...risk,
          riskOwner: user?.email || '',
        });
      });

      setServiceInfo({
        serviceName: "",
        serviceDescription: "",
        divisionId: "",
        teamId: "",
      });
      setRisks([]);
      setCurrentRisk({
        riskCategory: "",
        riskDescription: "",
        riskLevel: "",
        impact: "",
        mitigation: "",
        dataClassification: "",
      });

      toast({
        title: "Success",
        description: `${risks.length} risk assessment(s) submitted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit risk assessments. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-flixbus-green">
        <CardTitle className="text-white">New Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Information</h3>
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service/Product Name</Label>
              <Input
                id="serviceName"
                name="serviceName"
                value={serviceInfo.serviceName}
                onChange={handleServiceInfoChange}
                placeholder="Enter service or product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="divisionId">Division</Label>
              <Select
                value={serviceInfo.divisionId}
                onValueChange={(value) => handleServiceSelectChange("divisionId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId">Team</Label>
              <Select
                value={serviceInfo.teamId}
                onValueChange={(value) => handleServiceSelectChange("teamId", value)}
                disabled={!serviceInfo.divisionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={serviceInfo.divisionId ? "Select team" : "Select a division first"} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Service Description</Label>
              <Textarea
                id="serviceDescription"
                name="serviceDescription"
                value={serviceInfo.serviceDescription}
                onChange={handleServiceInfoChange}
                placeholder="Describe the service or product"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Risk Details</h3>
            <div className="space-y-2">
              <Label htmlFor="riskCategory">Risk Category</Label>
              <Select
                value={currentRisk.riskCategory}
                onValueChange={(value) => handleRiskSelectChange("riskCategory", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk category" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskDescription">Risk Description</Label>
              <Textarea
                id="riskDescription"
                name="riskDescription"
                value={currentRisk.riskDescription}
                onChange={handleRiskChange}
                placeholder="Describe the risk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={currentRisk.riskLevel}
                onValueChange={(value) => handleRiskSelectChange("riskLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "critical"].map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact Assessment</Label>
              <Textarea
                id="impact"
                name="impact"
                value={currentRisk.impact}
                onChange={handleRiskChange}
                placeholder="Describe the potential impact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitigation">Mitigation Measures</Label>
              <Textarea
                id="mitigation"
                name="mitigation"
                value={currentRisk.mitigation}
                onChange={handleRiskChange}
                placeholder="Describe mitigation measures"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataClassification">Data Classification</Label>
              <Select
                value={currentRisk.dataClassification}
                onValueChange={(value) =>
                  handleRiskSelectChange("dataClassification", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data classification" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_CLASSIFICATIONS.map((classification) => (
                    <SelectItem key={classification} value={classification}>
                      {classification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={addRisk}
              className="w-full"
              variant="secondary"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Risk
            </Button>
          </div>

          {risks.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Added Risks: {risks.length}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {risks.map((risk, index) => (
                    <li key={index}>
                      {risk.riskCategory} - {risk.riskLevel.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Submit Assessment ({risks.length} {risks.length === 1 ? 'risk' : 'risks'})
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentForm;
