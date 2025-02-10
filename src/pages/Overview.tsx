
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskLevelBadge from "@/components/RiskLevelBadge";
import { RiskAssessment, DIVISIONS } from "@/types/risk";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
    return DIVISIONS.map(division => {
      const divisionAssessments = assessments.filter(a => a.division === division);
      const serviceGroups = new Map<string, RiskAssessment[]>();
      
      divisionAssessments.forEach((assessment) => {
        const existing = serviceGroups.get(assessment.serviceName) || [];
        serviceGroups.set(assessment.serviceName, [...existing, assessment]);
      });
      
      return {
        division,
        services: Array.from(serviceGroups.entries()).map(([serviceName, risks]) => ({
          serviceName,
          risks,
          riskScore: calculateRiskScore(risks),
          criticalCount: risks.filter((r) => r.riskLevel === "critical").length,
          highCount: risks.filter((r) => r.riskLevel === "high").length,
          mediumCount: risks.filter((r) => r.riskLevel === "medium").length,
          lowCount: risks.filter((r) => r.riskLevel === "low").length,
        }))
      };
    });
  }, [assessments]);

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Overview by Division</h1>
      {groupedByDivision.map((division) => (
        <div key={division.division} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{division.division}</h2>
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
