"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "react-query";
import { getAllTeams } from "@/services/teams";
import { useRouter } from "next/navigation";
import { Search, Users, TrendingUp, Home } from "lucide-react";

export function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: teams, isLoading } = useQuery("admin-teams", getAllTeams);

  const filteredTeams = teams?.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-200">Manage teams and submissions</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="secondary"
              size="sm"
              className="text-primary bg-white/90 hover:bg-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{teams?.length || 0}</div>
                  <div className="text-sm text-primary-200">Total Teams</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-primary-200">Active Tasks</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-primary-200">Pending Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Search and manage all teams in the scavenger hunt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teams List */}
        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No teams found matching your search." : "No teams registered yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTeams.map((team) => (
              <Card 
                key={team.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                onClick={() => router.push(`/admin/teams/${team.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <CardDescription>
                        Created {team.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">0%</div>
                      <div className="text-sm text-muted-foreground">Progress</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{team.memberCount || 1}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">Submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
