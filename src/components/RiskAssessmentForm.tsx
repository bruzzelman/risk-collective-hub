
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
import { RiskLevel, RISK_CATEGORIES, DATA_CLASSIFICATIONS, DIVISIONS } from "@/types/risk";

interface RiskAssessmentFormProps {
  onSubmit: (data: any) => void;
}

const RiskAssessmentForm = ({ onSubmit }: RiskAssessmentFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceDescription: "",
    division: "",
    riskCategory: "",
    riskDescription: "",
    riskLevel: "",
    impact: "",
    mitigation: "",
    dataClassification: "",
    riskOwner: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some((value) => !value)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
    
    setFormData({
      serviceName: "",
      serviceDescription: "",
      division: "",
      riskCategory: "",
      riskDescription: "",
      riskLevel: "",
      impact: "",
      mitigation: "",
      dataClassification: "",
      riskOwner: "",
    });

    toast({
      title: "Success",
      description: "Risk assessment submitted successfully",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-flixbus-green">
        <CardTitle className="text-white">New Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service/Product Name</Label>
            <Input
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="Enter service or product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select
              value={formData.division}
              onValueChange={(value) => handleSelectChange("division", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
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
              value={formData.serviceDescription}
              onChange={handleChange}
              placeholder="Describe the service or product"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskCategory">Risk Category</Label>
            <Select
              value={formData.riskCategory}
              onValueChange={(value) => handleSelectChange("riskCategory", value)}
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
              value={formData.riskDescription}
              onChange={handleChange}
              placeholder="Describe the risk"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              value={formData.riskLevel}
              onValueChange={(value) => handleSelectChange("riskLevel", value)}
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
              value={formData.impact}
              onChange={handleChange}
              placeholder="Describe the potential impact"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mitigation">Mitigation Measures</Label>
            <Textarea
              id="mitigation"
              name="mitigation"
              value={formData.mitigation}
              onChange={handleChange}
              placeholder="Describe mitigation measures"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataClassification">Data Classification</Label>
            <Select
              value={formData.dataClassification}
              onValueChange={(value) =>
                handleSelectChange("dataClassification", value)
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

          <div className="space-y-2">
            <Label htmlFor="riskOwner">Risk Owner</Label>
            <Input
              id="riskOwner"
              name="riskOwner"
              value={formData.riskOwner}
              onChange={handleChange}
              placeholder="Enter the name of the risk owner"
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Assessment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentForm;
