
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

interface Division {
  id: string;
  name: string;
  description: string | null;
  parent_division_id: string | null;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  division_id: string;
  created_at: string;
}

const TeamsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDivisionDescription, setNewDivisionDescription] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  // Fetch divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
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
  });

  // Fetch teams for selected division
  const { data: teams = [] } = useQuery({
    queryKey: ['teams', selectedDivision],
    queryFn: async () => {
      if (!selectedDivision) return [];

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('division_id', selectedDivision)
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
    enabled: !!selectedDivision,
  });

  // Create division mutation
  const createDivision = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to create a division");

      const { data, error } = await supabase
        .from('divisions')
        .insert({
          name: newDivisionName,
          description: newDivisionDescription || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
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

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async () => {
      if (!selectedDivision) throw new Error("No division selected");
      if (!user) throw new Error("You must be logged in to create a team");

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: newTeamName,
          description: newTeamDescription || null,
          division_id: selectedDivision,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', selectedDivision] });
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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Divisions & Teams Management</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Divisions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Divisions</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {divisions.map((division) => (
                    <TableRow
                      key={division.id}
                      className={selectedDivision === division.id ? "bg-muted" : ""}
                    >
                      <TableCell>{division.name}</TableCell>
                      <TableCell>{division.description}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDivision(division.id)}
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

        {/* Teams Section */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDivision ? (
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

                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell>{team.name}</TableCell>
                          <TableCell>{team.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a division to manage its teams
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamsManagement;

