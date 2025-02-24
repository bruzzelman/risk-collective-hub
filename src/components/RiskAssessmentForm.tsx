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
import { RiskLevel, RISK_CATEGORIES, DATA_CLASSIFICATIONS, Service, RiskAssessment, DATA_INTERFACES } from "@/types/risk";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RiskAssessmentFormProps {
  onSubmit: (data: Omit<RiskAssessment, "id" | "createdAt">) => void;
}

const RiskAssessmentForm = ({ onSubmit }: RiskAssessmentFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState<Omit<Service, "id" | "createdAt" | "createdBy">>({
    name: "",
    description: "",
    divisionId: "",
    teamId: "",
  });

  const [risks, setRisks] = useState<Record<string, any[]>>({});
  const [currentRisk, setCurrentRisk] = useState({
    riskCategory: "",
    riskDescription: "",
    dataInterface: "",
    riskLevel: "",
    impact: "",
    mitigation: "",
    dataClassification: "",
  });

  // Query existing services
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ['services', currentService.teamId],
    queryFn: async () => {
      if (!currentService.teamId) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('team_id', currentService.teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((service): Service => ({
        id: service.id,
        name: service.name,
        description: service.description || "",
        divisionId: service.division_id,
        teamId: service.team_id,
        createdAt: new Date(service.created_at),
        createdBy: service.created_by,
      }));
    },
    enabled: !!currentService.teamId,
  });

  const { data: serviceRisks = [], refetch: refetchRisks } = useQuery({
    queryKey: ['risks', selectedServiceId],
    queryFn: async () => {
      if (!selectedServiceId) return [];
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('service_id', selectedServiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((risk): RiskAssessment => ({
        id: risk.id,
        serviceId: risk.service_id,
        riskCategory: risk.risk_category,
        riskDescription: risk.risk_description,
        dataInterface: risk.data_interface,
        riskLevel: risk.risk_level as RiskLevel,
        impact: risk.impact,
        mitigation: risk.mitigation,
        dataClassification: risk.data_classification,
        riskOwner: risk.risk_owner,
        createdAt: new Date(risk.created_at),
      }));
    },
    enabled: !!selectedServiceId,
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

  const addService = async () => {
    if (!currentService.name || !currentService.divisionId || !currentService.teamId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required service fields",
        variant: "destructive",
      });
      return;
    }

    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        name: currentService.name,
        description: currentService.description,
        division_id: currentService.divisionId,
        team_id: currentService.teamId,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSelectedServiceId(newService.id);
    // Only reset the service name and description, keep division and team
    setCurrentService((prev) => ({
      ...prev,
      name: "",
      description: "",
    }));

    refetchServices();

    toast({
      title: "Success",
      description: "Service added successfully",
    });
  };

  const removeService = async (serviceId: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (selectedServiceId === serviceId) {
      setSelectedServiceId(null);
    }

    refetchServices();

    toast({
      title: "Success",
      description: "Service removed successfully",
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

  const addRisk = async () => {
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

    const { error } = await supabase
      .from('risk_assessments')
      .insert({
        service_id: selectedServiceId,
        risk_category: currentRisk.riskCategory,
        risk_description: currentRisk.riskDescription,
        data_interface: currentRisk.dataInterface,
        risk_level: currentRisk.riskLevel,
        impact: currentRisk.impact,
        mitigation: currentRisk.mitigation,
        data_classification: currentRisk.dataClassification,
        risk_owner: user?.email || '',
        created_by: user?.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrentRisk({
      riskCategory: "",
      riskDescription: "",
      dataInterface: "",
      riskLevel: "",
      impact: "",
      mitigation: "",
      dataClassification: "",
    });

    refetchRisks();

    toast({
      title: "Success",
      description: "Risk added successfully",
    });
  };

  const removeRisk = async (riskId: string) => {
    const { error } = await supabase
      .from('risk_assessments')
      .delete()
      .eq('id', riskId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    refetchRisks();

    toast({
      title: "Success",
      description: "Risk removed successfully",
    });
  };

  const editRisk = async (risk: RiskAssessment) => {
    setCurrentRisk({
      riskCategory: risk.riskCategory,
      riskDescription: risk.riskDescription,
      dataInterface: risk.dataInterface,
      riskLevel: risk.riskLevel,
      impact: risk.impact,
      mitigation: risk.mitigation,
      dataClassification: risk.dataClassification,
    });

    const { error } = await supabase
      .from('risk_assessments')
      .delete()
      .eq('id', risk.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    refetchRisks();

    toast({
      description: "You can now edit the risk details",
    });
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-flixbus-green">
        <CardTitle className="text-white">New Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
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
                  onValueChange={(value) => {
                    handleServiceSelectChange("teamId", value);
                    setSelectedServiceId(null); // Reset selected service when team changes
                  }}
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
                <Label htmlFor="name">Product / Service name</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentService.name}
                  onChange={handleServiceChange}
                  placeholder="Enter service or product name"
                  disabled={!currentService.teamId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Service Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentService.description}
                  onChange={handleServiceChange}
                  placeholder="Describe the service or product"
                  disabled={!currentService.teamId}
                />
              </div>

              <Button
                type="button"
                onClick={addService}
                className="w-full"
                variant="secondary"
                disabled={!currentService.teamId}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <Separator />

            {/* Services List */}
            {currentService.teamId ? (
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
                          <h5 className="font-medium">{service.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            Risks: {serviceRisks.length}
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
                  {services.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No services added for this team yet
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Select a team to view and manage services
              </div>
            )}
          </div>

          {/* Right Column - Risk Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Details</h3>
              {selectedServiceId ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="riskDescription">Loss event description</Label>
                    <Textarea
                      id="riskDescription"
                      name="riskDescription"
                      value={currentRisk.riskDescription}
                      onChange={handleRiskChange}
                      placeholder="Describe the loss event"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riskCategory">Loss event category</Label>
                    <Select
                      value={currentRisk.riskCategory}
                      onValueChange={(value) => handleRiskSelectChange("riskCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select loss event category" />
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
                    <Label htmlFor="dataInterface">Loss event data interface</Label>
                    <Select
                      value={currentRisk.dataInterface}
                      onValueChange={(value) => handleRiskSelectChange("dataInterface", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data interface" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_INTERFACES.map((interface_) => (
                          <SelectItem key={interface_} value={interface_}>
                            {interface_}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                  {serviceRisks.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">
                        Added Risks: {serviceRisks.length}
                      </h4>
                      <div className="space-y-2">
                        {serviceRisks.map((risk) => (
                          <div
                            key={risk.id}
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
                                onClick={() => editRisk(risk)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRisk(risk.id)}
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
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentForm;
