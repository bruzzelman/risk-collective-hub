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
import { PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
}

interface ServiceInfo {
  id: string;
  serviceName: string;
  serviceDescription: string;
  divisionId: string;
  teamId: string;
}

const RiskAssessmentForm = ({ onSubmit }: RiskAssessmentFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [currentService, setCurrentService] = useState<ServiceInfo>({
    id: "",
    serviceName: "",
    serviceDescription: "",
    divisionId: "",
    teamId: "",
  });

  const [risks, setRisks] = useState<Record<string, any[]>>({});
  const [currentRisk, setCurrentRisk] = useState({
    riskCategory: "",
    riskDescription: "",
    riskLevel: "",
    impact: "",
    mitigation: "",
    dataClassification: "",
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
    queryKey: ['teams', currentService.divisionId],
    queryFn: async () => {
      if (!currentService.divisionId) return [];
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('division_id', currentService.divisionId);
      if (error) throw error;
      return data;
    },
    enabled: !!currentService.divisionId,
  });

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelectChange = (name: string, value: string) => {
    setCurrentService((prev) => {
      if (name === 'divisionId') {
        return { ...prev, [name]: value, teamId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const addService = () => {
    if (!currentService.serviceName || !currentService.divisionId || !currentService.teamId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required service fields",
        variant: "destructive",
      });
      return;
    }

    const serviceId = crypto.randomUUID();
    const newService = { ...currentService, id: serviceId };
    setServices((prev) => [...prev, newService]);
    setRisks((prev) => ({ ...prev, [serviceId]: [] }));
    setSelectedServiceId(serviceId);
    // Only reset the service name and description, keep division and team
    setCurrentService((prev) => ({
      ...prev,
      id: "",
      serviceName: "",
      serviceDescription: "",
    }));

    toast({
      title: "Success",
      description: "Service added successfully",
    });
  };

  const removeService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    setRisks((prev) => {
      const newRisks = { ...prev };
      delete newRisks[serviceId];
      return newRisks;
    });
    if (selectedServiceId === serviceId) {
      setSelectedServiceId(null);
    }
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
    if (!selectedServiceId) {
      toast({
        title: "Error",
        description: "Please select a service first",
        variant: "destructive",
      });
      return;
    }

    if (Object.values(currentRisk).some((value) => !value)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all risk fields",
        variant: "destructive",
      });
      return;
    }

    setRisks((prev) => ({
      ...prev,
      [selectedServiceId]: [...(prev[selectedServiceId] || []), { ...currentRisk }],
    }));

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

  const removeRisk = (serviceId: string, riskIndex: number) => {
    setRisks((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId].filter((_, index) => index !== riskIndex),
    }));

    toast({
      title: "Success",
      description: "Risk removed successfully",
    });
  };

  const editRisk = (serviceId: string, riskIndex: number) => {
    const riskToEdit = risks[serviceId][riskIndex];
    setCurrentRisk(riskToEdit);
    
    // Remove the risk that's being edited
    setRisks((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId].filter((_, index) => index !== riskIndex),
    }));

    toast({
      description: "You can now edit the risk details",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (services.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service",
        variant: "destructive",
      });
      return;
    }

    try {
      services.forEach((service) => {
        const serviceRisks = risks[service.id] || [];
        if (serviceRisks.length === 0) {
          toast({
            title: "Validation Error",
            description: `Please add at least one risk for service: ${service.serviceName}`,
            variant: "destructive",
          });
          throw new Error("Missing risks");
        }

        serviceRisks.forEach((risk) => {
          onSubmit({
            serviceName: service.serviceName,
            serviceDescription: service.serviceDescription,
            divisionId: service.divisionId,
            teamId: service.teamId,
            ...risk,
            riskOwner: user?.email || '',
          });
        });
      });

      setServices([]);
      setRisks({});
      setSelectedServiceId(null);
      setCurrentService({
        id: "",
        serviceName: "",
        serviceDescription: "",
        divisionId: "",
        teamId: "",
      });
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
        description: "All risk assessments submitted successfully",
      });
    } catch (error) {
      // Error already handled by toast
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-flixbus-green">
        <CardTitle className="text-white">New Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Service Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="divisionId">Division</Label>
                  <Select
                    value={currentService.divisionId}
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
                    value={currentService.teamId}
                    onValueChange={(value) => handleServiceSelectChange("teamId", value)}
                    disabled={!currentService.divisionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={currentService.divisionId ? "Select team" : "Select a division first"} />
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
                  <Label htmlFor="serviceName">Service/Product Name</Label>
                  <Input
                    id="serviceName"
                    name="serviceName"
                    value={currentService.serviceName}
                    onChange={handleServiceChange}
                    placeholder="Enter service or product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Service Description</Label>
                  <Textarea
                    id="serviceDescription"
                    name="serviceDescription"
                    value={currentService.serviceDescription}
                    onChange={handleServiceChange}
                    placeholder="Describe the service or product"
                  />
                </div>

                <Button
                  type="button"
                  onClick={addService}
                  className="w-full"
                  variant="secondary"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>

              <Separator />

              {/* Services List */}
              <div className="space-y-4">
                <h4 className="font-medium">Added Services</h4>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border ${
                        selectedServiceId === service.id ? 'bg-muted border-primary' : 'bg-card'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className="font-medium">{service.serviceName}</h5>
                          <p className="text-sm text-muted-foreground">
                            Risks: {(risks[service.id] || []).length}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            type="button"
                            variant={selectedServiceId === service.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedServiceId(service.id)}
                          >
                            {selectedServiceId === service.id ? "Selected" : "Select"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Risk Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Risk Details</h3>
                {selectedServiceId ? (
                  <>
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

                    {risks[selectedServiceId]?.length > 0 && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">
                          Added Risks: {risks[selectedServiceId].length}
                        </h4>
                        <div className="space-y-2">
                          {risks[selectedServiceId].map((risk, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded-lg border bg-card"
                            >
                              <div className="flex-1">
                                <p className="font-medium">
                                  {risk.riskCategory} - {risk.riskLevel.toUpperCase()}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {risk.riskDescription}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editRisk(selectedServiceId, index)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRisk(selectedServiceId, index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a service to add risks
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <Button type="submit" className="w-full">
            Submit Assessment ({Object.values(risks).flat().length} risks across {services.length} services)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentForm;
