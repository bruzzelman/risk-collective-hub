
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FolderPlus, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Division {
  id: string;
  name: string;
  description: string | null;
  team_id: string;
  parent_division_id: string | null;
  created_at: string;
}

const TeamsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDivisionDescription, setNewDivisionDescription] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching teams",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Team[];
    },
  });

  // Fetch divisions for selected team
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions', selectedTeam],
    queryFn: async () => {
      if (!selectedTeam) return [];

      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .eq('team_id', selectedTeam)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching divisions",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Division[];
    },
    enabled: !!selectedTeam,
  });

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            name: newTeamName,
            description: newTeamDescription || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setNewTeamName("");
      setNewTeamDescription("");
      toast({
        title: "Success",
        description: "Team created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create division mutation
  const createDivision = useMutation({
    mutationFn: async () => {
      if (!selectedTeam) throw new Error("No team selected");

      const { data, error } = await supabase
        .from('divisions')
        .insert([
          {
            name: newDivisionName,
            description: newDivisionDescription || null,
            team_id: selectedTeam,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions', selectedTeam] });
      setNewDivisionName("");
      setNewDivisionDescription("");
      toast({
        title: "Success",
        description: "Division created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating division",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Teams & Divisions Management</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teams Section */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">New Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDescription">Description (optional)</Label>
                <Input
                  id="teamDescription"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                />
              </div>
              <Button
                onClick={() => createTeam.mutate()}
                disabled={!newTeamName || createTeam.isPending}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>

            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow
                      key={team.id}
                      className={selectedTeam === team.id ? "bg-muted" : ""}
                    >
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.description}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTeam(team.id)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Divisions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Divisions</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTeam ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="divisionName">New Division Name</Label>
                  <Input
                    id="divisionName"
                    value={newDivisionName}
                    onChange={(e) => setNewDivisionName(e.target.value)}
                    placeholder="Enter division name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="divisionDescription">Description (optional)</Label>
                  <Input
                    id="divisionDescription"
                    value={newDivisionDescription}
                    onChange={(e) => setNewDivisionDescription(e.target.value)}
                    placeholder="Enter division description"
                  />
                </div>
                <Button
                  onClick={() => createDivision.mutate()}
                  disabled={!newDivisionName || createDivision.isPending}
                  className="w-full"
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Division
                </Button>

                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {divisions.map((division) => (
                        <TableRow key={division.id}>
                          <TableCell>{division.name}</TableCell>
                          <TableCell>{division.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a team to manage its divisions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamsManagement;
