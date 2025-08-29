"use client";

// ...existing code...
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "react-query";
import { getTeamsProgress, getAllSubmissionsForAdmin } from "@/services/submissions";
import { useAdminUpdateSubmission } from "@/hooks/use-admin-update-submission";
import { useRouter } from "next/navigation";
import { Search, Users, TrendingUp, Home, FileText, Trophy, Camera, CheckCircle, Clock, Eye, Download, Calendar } from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"teams" | "tasks" | "submissions">("teams");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const router = useRouter();

  const { data: teamsProgress, isLoading: teamsLoading } = useQuery("teams-progress", getTeamsProgress);
  const { data: allSubmissions, isLoading: submissionsLoading } = useQuery("all-submissions", getAllSubmissionsForAdmin);

  const filteredTeams = teamsProgress?.filter(team =>
    team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalTeams: teamsProgress?.length || 0,
    activeTeams: teamsProgress?.filter(t => t.submissions.length > 0).length || 0,
    totalSubmissions: allSubmissions?.length || 0,
    pendingReviews: allSubmissions?.filter(s => s.status === "pending").length || 0
  };

  if (teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#BB133A] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">🛡️ Admin Dashboard</h1>
              <p className="text-red-100">FSV UK Scavenger Hunt Management</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="secondary"
              size="sm"
              className="text-[#BB133A] bg-white hover:bg-gray-100"
            >
              <Home className="w-4 h-4 mr-2" />
              User View
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Total Teams</p>
                    <p className="text-2xl font-bold">{stats.totalTeams}</p>
                  </div>
                  <Users className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Active Teams</p>
                    <p className="text-2xl font-bold">{stats.activeTeams}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Submissions</p>
                    <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                  </div>
                  <Camera className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                  </div>
                  <Clock className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("teams")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "teams"
                  ? "border-[#BB133A] text-[#BB133A]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Teams Management
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "tasks"
                  ? "border-[#BB133A] text-[#BB133A]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Tasks Management
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "submissions"
                  ? "border-[#BB133A] text-[#BB133A]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Submissions Review
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === "teams" && (
          <TeamsManagement 
            teams={filteredTeams} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
          />
        )}
        {activeTab === "tasks" && (
          <TasksManagement />
        )}
        {activeTab === "submissions" && (
          <SubmissionsManagement submissions={allSubmissions || []} loading={submissionsLoading} />
        )}
      </div>
    </div>
  );
}

// Teams Management Component
function TeamsManagement({ 
  teams, 
  searchTerm, 
  setSearchTerm,
  selectedTeam,
  setSelectedTeam 
}: { 
  teams: any[], 
  searchTerm: string, 
  setSearchTerm: (term: string) => void,
  selectedTeam: string | null,
  setSelectedTeam: (teamId: string | null) => void
}) {
  
  // Ak je vybraný tím, zobraz detail
  if (selectedTeam) {
    const team = teams.find(t => t.teamId === selectedTeam);
    if (team) {
      return <TeamDetail team={team} onBack={() => setSelectedTeam(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teams Progress Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.teamId} className="border-l-4 border-l-[#BB133A] hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Profile Photo */}
                  {team.profilePhoto ? (
                    <Image
                      src={team.profilePhoto}
                      alt={`${team.teamName} profile`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#BB133A]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.teamName}</h3>
                    <p className="text-sm text-gray-500">
                      Last activity: {team.lastActivity?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={team.pendingSubmissions > 0 ? "default" : "default"} 
                           className={team.pendingSubmissions > 0 ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}>
                      {team.pendingSubmissions} pending
                    </Badge>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {team.completedTasks}/{team.totalTasks} completed
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Progress Stats */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#BB133A]">{team.totalPoints}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{team.submissions.length}</div>
                    <div className="text-xs text-gray-500">Submissions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round((team.completedTasks / team.totalTasks) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                  
                  <Button
                    onClick={() => setSelectedTeam(team.teamId)}
                    variant="outline"
                    size="sm"
                    className="text-[#BB133A] border-[#BB133A] hover:bg-[#BB133A] hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{team.completedTasks} of {team.totalTasks} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#BB133A] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(team.completedTasks / team.totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {teams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-500">
                {searchTerm ? "No teams match your search criteria." : "No teams have registered yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Team Detail Component
function TeamDetail({ team, onBack }: { team: any, onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            ← Back to Teams
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{team.teamName}</h2>
        </div>
      </div>

      {/* Team Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Profile</CardTitle>
          <CardDescription>Team information and profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {team.profilePhoto ? (
                <Image
                  src={team.profilePhoto}
                  alt={`${team.teamName} profile`}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#BB133A]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.teamName}</h3>
              {team.description ? (
                <p className="text-gray-600 leading-relaxed">{team.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#BB133A]">{team.totalPoints}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{team.submissions.length}</div>
            <div className="text-sm text-gray-500">Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{team.completedTasks}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{team.pendingSubmissions}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Team Submissions</CardTitle>
          <CardDescription>All files and photos uploaded by this team</CardDescription>
        </CardHeader>
        <CardContent>
          {team.submissions.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.submissions.map((submission: any) => (
                <Card key={submission.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {submission.type === 'image' ? (
                      <Image
                        src={submission.downloadURL}
                        alt={submission.caption}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={submission.status === "approved" ? "default" : 
                                   submission.status === "rejected" ? "default" : "default"}
                             className={submission.status === "approved" ? "bg-green-100 text-green-800" :
                                      submission.status === "rejected" ? "bg-red-100 text-red-800" :
                                      "bg-orange-100 text-orange-800"}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-2">{submission.caption}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {submission.submittedAt?.toDate?.()?.toLocaleDateString()}
                      </span>
                      {submission.points && (
                        <span className="text-sm font-semibold text-[#BB133A]">
                          {submission.points} pts
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tasks Management Component
function TasksManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tasks Management</h2>
        <Button className="bg-[#BB133A] hover:bg-[#9A0F2E] text-white">
          <FileText className="w-4 h-4 mr-2" />
          Create New Task
        </Button>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tasks Management</h3>
          <p className="text-gray-500 mb-4">
            Create, edit, and manage scavenger hunt tasks here.
          </p>
          <Button className="bg-[#BB133A] hover:bg-[#9A0F2E] text-white">
            Add Test Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Submissions Management Component
function SubmissionsManagement({ submissions, loading }: { submissions: any[], loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const recentSubmissions = submissions.slice(0, 20); // Show last 20

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Submissions Review</h2>
        <Badge variant="default" className="bg-orange-100 text-orange-800">
          {pendingSubmissions.length} pending review
        </Badge>
      </div>

      {/* Pending Submissions First */}
      {pendingSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700">⚠️ Pending Review</CardTitle>
            <CardDescription>These submissions need your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} isPending={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest submissions from all teams</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-500">
                Team submissions will appear here for review and approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} isPending={false} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Submission Card Component
import { useState } from "react";
function SubmissionCard({ submission, isPending }: { submission: any, isPending: boolean }) {
  const adminUpdate = useAdminUpdateSubmission();
  const [points, setPoints] = useState(submission.points || 0);
  const [pointsEdit, setPointsEdit] = useState(false);
  const [pointsInput, setPointsInput] = useState(points.toString());

  const handleApprove = () => {
    adminUpdate.mutate({
      teamId: submission.teamId,
      submissionId: submission.id,
      updates: { status: "approved", approved: true, points: points, taskId: submission.taskId },
    });
  };
  const handleReject = () => {
    adminUpdate.mutate({
      teamId: submission.teamId,
      submissionId: submission.id,
      updates: { status: "rejected", approved: false },
    });
  };
  const handlePointsSave = () => {
    const val = parseInt(pointsInput, 10);
    if (!isNaN(val)) {
      setPoints(val);
      adminUpdate.mutate({
        teamId: submission.teamId,
        submissionId: submission.id,
        updates: { points: val },
      });
      setPointsEdit(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${isPending ? 'border-orange-200 bg-orange-50' : ''}`}>
      <div className="aspect-video bg-gray-100 relative">
        {submission.type === 'image' ? (
          <Image
            src={submission.downloadURL}
            alt={submission.caption}
            width={400}
            height={225}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="default"
                 className={submission.status === "approved" ? "bg-green-100 text-green-800" :
                          submission.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-orange-100 text-orange-800"}>
            {submission.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm text-[#BB133A]">{submission.teamName}</h4>
          <div className="flex items-center space-x-2">
            {pointsEdit ? (
              <>
                <input
                  type="number"
                  value={pointsInput}
                  onChange={e => setPointsInput(e.target.value)}
                  className="w-16 border rounded px-1 text-sm"
                  min={0}
                />
                <Button size="sm" onClick={handlePointsSave} className="px-2 py-1 text-xs">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setPointsEdit(false); setPointsInput(points.toString()); }} className="px-2 py-1 text-xs">Cancel</Button>
              </>
            ) : (
              <span className="text-sm font-bold text-green-600 cursor-pointer" onClick={() => setPointsEdit(true)} title="Edit points">{points} pts</span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{submission.caption}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <span>
            <Calendar className="w-3 h-3 inline mr-1" />
            {submission.submittedAt?.toDate?.()?.toLocaleDateString()}
          </span>
        </div>
        {isPending && (
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={adminUpdate.isLoading}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50" onClick={handleReject} disabled={adminUpdate.isLoading}>
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
