
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskLevelBadge from "@/components/RiskLevelBadge";
import { RiskAssessment, RISK_CATEGORIES, DATA_CLASSIFICATIONS } from "@/types/risk";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OverviewProps {
  assessments: RiskAssessment[];
}

const calculateRiskScore = (risks: RiskAssessment[]): number => {
  const weights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  if (risks.length === 0) return 0;

  const totalScore = risks.reduce((acc, risk) => acc + weights[risk.riskLevel], 0);
  return Math.round((totalScore / (risks.length * 4)) * 100); // Normalize to 0-100
};

const Overview = ({ assessments }: OverviewProps) => {
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [filterRiskCategory, setFilterRiskCategory] = useState<string>("all");
  const [filterDataClass, setFilterDataClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"riskScore" | "serviceName" | "risksCount">("riskScore");

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

  const toggleService = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const groupedByDivision = useMemo(() => {
    return divisions.map(division => {
      const divisionAssessments = assessments.filter(a => a.divisionId === division.id);
      const serviceGroups = new Map<string, RiskAssessment[]>();
      
      divisionAssessments.forEach((assessment) => {
        // Apply filters
        if (filterRiskCategory !== "all" && assessment.riskCategory !== filterRiskCategory) return;
        if (filterDataClass !== "all" && assessment.dataClassification !== filterDataClass) return;
        
        const existing = serviceGroups.get(assessment.serviceName) || [];
        serviceGroups.set(assessment.serviceName, [...existing, assessment]);
      });
      
      let services = Array.from(serviceGroups.entries()).map(([serviceName, risks]) => ({
        serviceName,
        risks,
        riskScore: calculateRiskScore(risks),
        criticalCount: risks.filter((r) => r.riskLevel === "critical").length,
        highCount: risks.filter((r) => r.riskLevel === "high").length,
        mediumCount: risks.filter((r) => r.riskLevel === "medium").length,
        lowCount: risks.filter((r) => r.riskLevel === "low").length,
      }));

      // Apply sorting
      services = services.sort((a, b) => {
        switch (sortBy) {
          case "riskScore":
            return b.riskScore - a.riskScore;
          case "serviceName":
            return a.serviceName.localeCompare(b.serviceName);
          case "risksCount":
            return b.risks.length - a.risks.length;
          default:
            return 0;
        }
      });

      return {
        name: division.name,
        id: division.id,
        services
      };
    });
  }, [assessments, filterRiskCategory, filterDataClass, sortBy, divisions]);

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Overview by Division</h1>
      
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={sortBy} onValueChange={(value: "riskScore" | "serviceName" | "risksCount") => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="riskScore">Risk Score</SelectItem>
            <SelectItem value="serviceName">Service Name</SelectItem>
            <SelectItem value="risksCount">Number of Risks</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRiskCategory} onValueChange={setFilterRiskCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Risk Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {RISK_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDataClass} onValueChange={setFilterDataClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Data Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            {DATA_CLASSIFICATIONS.map((classification) => (
              <SelectItem key={classification} value={classification}>
                {classification}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {groupedByDivision.map((division) => (
        <div key={division.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{division.name}</h2>
          <div className="grid gap-6">
            {division.services.map((service) => (
              <Card key={service.serviceName}>
                <CardHeader className="bg-flixbus-green">
                  <CardTitle className="text-white">
                    {service.serviceName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Collapsible
                    open={expandedServices.has(service.serviceName)}
                    onOpenChange={() => toggleService(service.serviceName)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          Risk Score: {service.riskScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on {service.risks.length} risk assessments
                        </div>
                      </div>
                      <CollapsibleTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        {expandedServices.has(service.serviceName) ? (
                          <ChevronUp className="h-6 w-6" />
                        ) : (
                          <ChevronDown className="h-6 w-6" />
                        )}
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Critical</p>
                            <div className="flex items-center gap-2">
                              <RiskLevelBadge level="critical" />
                              <span>{service.criticalCount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">High</p>
                            <div className="flex items-center gap-2">
                              <RiskLevelBadge level="high" />
                              <span>{service.highCount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Medium</p>
                            <div className="flex items-center gap-2">
                              <RiskLevelBadge level="medium" />
                              <span>{service.mediumCount}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Low</p>
                            <div className="flex items-center gap-2">
                              <RiskLevelBadge level="low" />
                              <span>{service.lowCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {service.risks.map((risk) => (
                            <div
                              key={risk.id}
                              className="p-4 border rounded-lg space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{risk.riskCategory}</h3>
                                <RiskLevelBadge level={risk.riskLevel} />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {risk.riskDescription}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm font-medium">Impact</p>
                                  <p className="text-sm text-muted-foreground">
                                    {risk.impact}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Mitigation</p>
                                  <p className="text-sm text-muted-foreground">
                                    {risk.mitigation}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-2">
                                Owner: {risk.riskOwner}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Overview;
