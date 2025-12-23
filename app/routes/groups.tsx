import { useLoaderData, redirect, Link, Form, useActionData, useNavigation } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Users, Plus, Search, Key, Check, X, LayoutDashboard, UserPlus } from "lucide-react";
import type { Route } from "./+types/groups";
import { verifyToken } from "../server/config/jwt.js";
import { prisma } from "../server/config/database.js";
import { getCookieName } from "../server/utils/cookie.js";
import { getAllGroups, getGroupById, joinGroup, type GroupResponse } from "../server/services/groupService.js";

interface ActionData {
  success?: boolean;
  message?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Study Groups - StudyBuddy" },
    { name: "description", content: "Browse and join study groups" },
  ];
}

interface LoaderData {
  groups: GroupResponse[];
  userId: string;
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData | Response> {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return redirect("/auth/login");
  }

  try {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const authCookie = cookies.find((c) => c.startsWith(`${getCookieName()}=`));

    if (!authCookie) {
      return redirect("/auth/login");
    }

    const token = authCookie.split("=")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return redirect("/auth/login");
    }

    const groups = await getAllGroups(user.id);

    return { groups, userId: user.id };
  } catch {
    return redirect("/auth/login");
  }
}

export async function action({ request }: Route.ActionArgs): Promise<ActionData | Response> {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return redirect("/auth/login");
  }

  try {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const authCookie = cookies.find((c) => c.startsWith(`${getCookieName()}=`));

    if (!authCookie) {
      return redirect("/auth/login");
    }

    const token = authCookie.split("=")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return redirect("/auth/login");
    }

    const formData = await request.formData();
    const groupCode = formData.get("groupCode") as string;

    if (!groupCode || groupCode.trim().length === 0) {
      return { success: false, message: "Please enter a group code" };
    }

    // Try to find the group by ID
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupCode.trim() },
    });

    if (!group) {
      return { success: false, message: "Group not found. Check the code and try again." };
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId: payload.userId, groupId: group.id },
      },
    });

    if (existingMember) {
      return { success: false, message: "You're already a member of this group." };
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.groupJoinRequest.findUnique({
      where: {
        userId_groupId: { userId: payload.userId, groupId: group.id },
      },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      return { success: false, message: "You already have a pending request for this group." };
    }

    // Create a join request instead of directly joining
    const { createJoinRequest } = await import("./../server/services/joinRequestService.js");
    await createJoinRequest({
      userId: payload.userId,
      groupId: group.id,
    });

    return { success: true, message: "Join request sent! The group owner will review your request." };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export default function GroupsPage() {
  const { groups, userId } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-background-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm font-semibold text-background-700 hover:text-primary-600 transition-colors">
            <LayoutDashboard className="h-4 w-4 mr-1.5" />
            Dashboard
          </Link>
          <span className="text-background-300">/</span>
          <span className="text-sm font-medium text-background-500">Study Groups</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-background-900">Study Groups</h1>
            <p className="text-background-600 text-base mt-1">Join or create study groups to collaborate with classmates</p>
          </div>
          <Link to="/groups/create">
            <Button size="md">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </Link>
        </div>

        {/* Join by Code */}
        <Card className="mb-8 border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-white">
          <CardContent className="p-6">
            <Form method="post" className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-base font-semibold text-background-900 mb-3 flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary-600" />
                  Request to Join with Group Code
                </label>
                <input
                  type="text"
                  name="groupCode"
                  placeholder="Enter group code or ID..."
                  className="flex h-12 w-full rounded-xl border-2 border-background-300 bg-white px-4 text-base text-background-900 transition-all duration-200 placeholder:text-background-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none shadow-sm"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-12 px-6">
                  {isSubmitting ? "Requesting..." : "Request to Join"}
                </Button>
              </div>
            </Form>
            {actionData?.message && (
              <div className={`mt-4 p-4 rounded-xl text-base flex items-center gap-2 ${
                actionData.success
                  ? "bg-success-50 text-success-700 border border-success-200"
                  : "bg-error-50 text-error-700 border border-error-200"
              }`}>
                {actionData.success ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                {actionData.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-background-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-bold text-primary-600">{groups.length}</p>
              <p className="text-sm font-medium text-background-700 mt-1">Total Groups</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary-200 bg-primary-50 shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-bold text-primary-700">
                {groups.filter(g => g.isMember).length}
              </p>
              <p className="text-sm font-medium text-background-700 mt-1">Your Groups</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-background-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-bold text-success-600">
                {groups.filter(g => !g.isMember && g.ownerId !== userId).length}
              </p>
              <p className="text-sm font-medium text-background-700 mt-1">Available to Join</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {groups.length === 0 ? (
          <Card className="border-2 border-dashed border-background-300 bg-white">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-background-900 mb-3">No study groups yet</h3>
              <p className="text-background-600 mb-8 max-w-sm mx-auto text-base">
                Create your first study group and start collaborating with classmates
              </p>
              <Link to="/groups/create">
                <Button size="md">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <Card
                key={group.id}
                className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
                  group.isMember ? 'border-primary-300 bg-primary-50/50' : 'border-background-200 bg-white'
                }`}
              >
                <CardContent className="p-5">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-background-900 text-lg line-clamp-1 flex-1">
                        {group.name}
                      </h3>
                      {group.ownerId === userId && group.pendingRequestCount !== undefined && group.pendingRequestCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning-100 text-warning-700 text-xs font-semibold ml-2 shrink-0">
                          <UserPlus className="h-3 w-3" />
                          {group.pendingRequestCount}
                        </span>
                      )}
                    </div>
                    {group.description ? (
                      <p className="text-sm text-background-600 line-clamp-2">
                        {group.description}
                      </p>
                    ) : (
                      <p className="text-sm text-background-400 italic">No description</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-background-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{group.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        group.isMember ? 'bg-success-500' : 'bg-background-300'
                      }`} />
                      <span className="font-medium">{group.isMember ? 'Joined' : 'Available'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/groups/${group.id}`} className="flex-1">
                      <Button
                        variant={group.isMember ? "primary" : "outline"}
                        size="md"
                        className="w-full"
                      >
                        {group.isMember ? 'Open Group' : 'View Details'}
                      </Button>
                    </Link>
                  </div>

                  {group.ownerId === userId && (
                    <p className="text-xs text-primary-600 mt-3 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                      You own this group
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
