import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskLevelBadge from "@/components/RiskLevelBadge";
import { RiskAssessment } from "@/types/risk";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RiskAssessmentsProps {
  assessments: RiskAssessment[];
}

// Calculate security score based on risk levels and mitigation
const calculateSecurityScore = (risks: RiskAssessment[]): number => {
  if (risks.length === 0) return 0;

  const weights = {
    critical: 4,  // Critical risks count as 4 points
    high: 3,      // High risks count as 3 points
    medium: 2,    // Medium risks count as 2 points
    low: 1        // Low risks count as 1 point
  };

  // Sum up all risk points
  return risks.reduce((total, risk) => total + weights[risk.riskLevel], 0);
};

const RiskAssessments = ({ assessments }: RiskAssessmentsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data;
    }
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
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const groupedAssessments = useMemo(() => {
    // First, filter assessments based on search
    const filteredAssessments = assessments.filter(assessment => {
      const service = services.find(s => s.id === assessment.serviceId);
      if (!service) return false;

      return (
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.riskCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.riskDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Group by division and team
    const grouped = divisions.reduce((acc, division) => {
      const divisionServices = services.filter(s => s.division_id === division.id);
      const divisionTeams = teams.filter(t => 
        divisionServices.some(s => s.team_id === t.id)
      );

      const teamAssessments = divisionTeams.map(team => {
        const teamServices = divisionServices.filter(s => s.team_id === team.id);
        const teamRisks = filteredAssessments.filter(assessment => 
          teamServices.some(s => s.id === assessment.serviceId)
        );

        return {
          team,
          risks: teamRisks,
          securityScore: calculateSecurityScore(teamRisks)
        };
      });

      const divisionRisks = filteredAssessments.filter(assessment =>
        divisionServices.some(s => s.id === assessment.serviceId)
      );

      if (divisionRisks.length > 0 || (filterDivision === "all" && teamAssessments.some(t => t.risks.length > 0))) {
        acc.push({
          division,
          teams: teamAssessments.filter(t => t.risks.length > 0),
          risks: divisionRisks,
          securityScore: calculateSecurityScore(divisionRisks)
        });
      }

      return acc;
    }, [] as Array<{
      division: typeof divisions[0];
      teams: Array<{
        team: typeof teams[0];
        risks: RiskAssessment[];
        securityScore: number;
      }>;
      risks: RiskAssessment[];
      securityScore: number;
    }>);

    return grouped;
  }, [assessments, divisions, teams, services, searchTerm, filterDivision]);

  const toggleDivision = (divisionId: string) => {
    const newExpanded = new Set(expandedDivisions);
    if (newExpanded.has(divisionId)) {
      newExpanded.delete(divisionId);
    } else {
      newExpanded.add(divisionId);
    }
    setExpandedDivisions(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    if (score <= 9) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Assessments by Division</h1>

      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <Input
          placeholder="Search risks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />

        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {groupedAssessments.map(({ division, teams, risks, securityScore }) => (
          <Card key={division.id}>
            <Collapsible
              open={expandedDivisions.has(division.id)}
              onOpenChange={() => toggleDivision(division.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{division.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {risks.length} risks across {teams.length} teams
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Risk Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                      {securityScore}
                    </div>
                  </div>
                  <CollapsibleTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    {expandedDivisions.has(division.id) ? (
                      <ChevronUp className="h-6 w-6" />
                    ) : (
                      <ChevronDown className="h-6 w-6" />
                    )}
                  </CollapsibleTrigger>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Teams Section */}
                  {teams.map(({ team, risks: teamRisks, securityScore: teamScore }) => (
                    <div key={team.id} className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{team.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Risk Score:</span>
                          <span className={`font-bold ${getScoreColor(teamScore)}`}>
                            {teamScore}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {teamRisks.map((risk) => {
                          const service = services.find(s => s.id === risk.serviceId);
                          return (
                            <div key={risk.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{service?.name}</h4>
                                  <div className="text-sm text-muted-foreground">
                                    {risk.riskCategory}
                                  </div>
                                </div>
                                <RiskLevelBadge level={risk.riskLevel} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-4">
                                {risk.riskDescription}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium">Impact</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {risk.impact}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium">Mitigation</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {risk.mitigation}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                                <div>Owner: {risk.riskOwner}</div>
                                <div>Classification: {risk.dataClassification}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RiskAssessments;
