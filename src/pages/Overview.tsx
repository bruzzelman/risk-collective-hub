
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskLevelBadge from "@/components/RiskLevelBadge";
import { RiskAssessment, DIVISIONS } from "@/types/risk";

interface OverviewProps {
  assessments: RiskAssessment[];
}

const Overview = ({ assessments }: OverviewProps) => {
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
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Total Risks: {service.risks.length}
                    </p>
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
                    <div className="mt-4">
                      {service.risks.map((risk) => (
                        <div
                          key={risk.id}
                          className="p-4 border rounded-lg mt-2 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{risk.riskCategory}</h3>
                            <RiskLevelBadge level={risk.riskLevel} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {risk.riskDescription}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
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
