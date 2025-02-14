
import { useState } from "react";
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

interface RiskAssessmentsProps {
  assessments: RiskAssessment[];
}

const RiskAssessments = ({ assessments }: RiskAssessmentsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");

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

  const filteredAssessments = assessments.filter(assessment => {
    const service = services.find(s => s.id === assessment.serviceId);
    if (!service) return false;

    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.riskCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.riskDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDivision = filterDivision === "all" || service.division_id === filterDivision;
    const matchesTeam = filterTeam === "all" || service.team_id === filterTeam;

    return matchesSearch && matchesDivision && matchesTeam;
  });

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Assessments</h1>

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

        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredAssessments.map((assessment) => {
          const service = services.find(s => s.id === assessment.serviceId);
          const division = divisions.find(d => d.id === service?.division_id);
          const team = teams.find(t => t.id === service?.team_id);

          return (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service?.name || "Unknown Service"}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {division?.name || "Unknown Division"} • {team?.name || "Unknown Team"}
                    </div>
                  </div>
                  <RiskLevelBadge level={assessment.riskLevel} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">{assessment.riskCategory}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assessment.riskDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        {assessment.impact}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Mitigation</h4>
                      <p className="text-sm text-muted-foreground">
                        {assessment.mitigation}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>Owner: {assessment.riskOwner}</div>
                    <div>Data Classification: {assessment.dataClassification}</div>
                    <div>Added: {assessment.createdAt.toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RiskAssessments;
