import { Form, useLoaderData, redirect, Link, useNavigation, useActionData, useFetcher } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { ArrowLeft, Users, FileText, Calendar, MessageSquare, User, Crown, Check, Copy, Share2, LayoutDashboard, Clock, UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { Route } from "./+types/groups.$id";
import { verifyToken } from "../server/config/jwt.js";
import { prisma } from "../server/config/database.js";
import { getCookieName } from "../server/utils/cookie.js";
import { getGroupById, leaveGroup, isGroupMember, type GroupDetailResponse } from "../server/services/groupService.js";
import { getGroupRequests } from "../server/services/joinRequestService.js";

interface ActionData {
  success?: boolean;
  message?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Group - StudyBuddy" },
    { name: "description", content: "Study group details" },
  ];
}

interface JoinRequest {
  id: string;
  userId: string;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface LoaderData {
  group: GroupDetailResponse;
  userId: string;
  isMember: boolean;
  isOwner: boolean;
  pendingRequests?: JoinRequest[];
}

export async function loader({ request, params }: Route.LoaderArgs): Promise<LoaderData | Response> {
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

    const groupId = params.id;
    if (!groupId) {
      return redirect("/groups");
    }

    const group = await getGroupById(groupId, user.id);
    const isMember = await isGroupMember(groupId, user.id);
    const isOwner = group.ownerId === user.id;

    // Fetch pending requests if owner
    let pendingRequests: JoinRequest[] | undefined;
    if (isOwner) {
      try {
        pendingRequests = await getGroupRequests({ groupId, userId: user.id });
      } catch {
        pendingRequests = undefined;
      }
    }

    return { group, userId: user.id, isMember, isOwner, pendingRequests };
  } catch (error) {
    if (error instanceof Error && error.message === "Group not found") {
      return redirect("/groups");
    }
    return redirect("/groups");
  }
}

export async function action({ request, params }: Route.ActionArgs): Promise<Response | ActionData> {
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
    const intent = formData.get("intent") as string;
    const groupId = params.id;

    if (!groupId) {
      return { success: false, message: "Group ID is required" };
    }

    if (intent === "leave") {
      const { leaveGroup } = await import("../server/services/groupService.js");
      await leaveGroup(groupId, payload.userId);
      return redirect(`/groups/${groupId}`);
    }

    // Handle join request actions
    if (intent === "request-join") {
      const { createJoinRequest } = await import("../server/services/joinRequestService.js");
      await createJoinRequest({
        userId: payload.userId,
        groupId,
      });
      return { success: true, message: "Join request sent! Waiting for owner approval." };
    }

    if (intent === "cancel-request") {
      const { cancelJoinRequest } = await import("../server/services/joinRequestService.js");
      await cancelJoinRequest({ userId: payload.userId, groupId });
      return { success: true, message: "Join request cancelled." };
    }

    // Handle accept/reject join request actions
    if (intent === "accept" || intent === "reject") {
      const requestId = formData.get("requestId") as string;
      if (!requestId) {
        return { success: false, message: "Request ID is required" };
      }

      const { updateJoinRequest } = await import("../server/services/joinRequestService.js");
      await updateJoinRequest({
        requestId,
        status: intent === "accept" ? "ACCEPTED" : "REJECTED",
      });
      return { success: true, message: intent === "accept" ? "Request accepted!" : "Request declined." };
    }

    return { success: false, message: "Invalid action" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export default function GroupDetailPage() {
  const { group, userId, isMember, isOwner, pendingRequests = [] } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [copied, setCopied] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  // Fetcher for accept/reject actions (non-redirecting)
  const requestFetcher = useFetcher();

  const copyGroupCode = () => {
    navigator.clipboard.writeText(group.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestAction = (requestId: string, action: "accept" | "reject") => {
    const formData = new FormData();
    formData.append("intent", action);
    formData.append("requestId", requestId);
    // Submit to current page to trigger reload after action
    requestFetcher.submit(formData, { method: "post", action: `/groups/${group.id}` });
  };

  return (
    <div className="min-h-screen bg-background-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm font-semibold text-background-700 hover:text-primary-600 transition-colors">
            <LayoutDashboard className="h-4 w-4 mr-1.5" />
            Dashboard
          </Link>
          <span className="text-background-300">/</span>
          <Link to="/groups" className="inline-flex items-center text-sm font-semibold text-background-700 hover:text-primary-600 transition-colors">
            <Users className="h-4 w-4 mr-1.5" />
            Groups
          </Link>
          <span className="text-background-300">/</span>
          <span className="text-sm font-medium text-background-500">{group.name}</span>
        </div>

        {/* Group Header */}
        <Card className="mb-6 border-2 border-background-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-background-900">{group.name}</h1>
                  {isOwner && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                      <Crown className="h-3.5 w-3.5" />
                      Owner
                    </span>
                  )}
                  {isMember && !isOwner && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-100 text-success-700 text-sm font-semibold">
                      <Check className="h-3.5 w-3.5" />
                      Member
                    </span>
                  )}
                </div>
                {group.description ? (
                  <p className="text-base text-background-700">{group.description}</p>
                ) : (
                  <p className="text-base text-background-400 italic">No description provided</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t-2 border-background-200 text-sm">
              <div className="flex items-center gap-2 text-background-700">
                <User className="h-5 w-5 text-primary-600" />
                <span>Created by <span className="font-bold text-background-900">{isOwner ? "you" : group.ownerName}</span></span>
              </div>
              <div className="flex items-center gap-2 text-background-700">
                <Users className="h-5 w-5 text-primary-600" />
                <span><span className="font-bold text-background-900">{group.memberCount}</span> members</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests Banner - Owner Only */}
        {isOwner && pendingRequests.length > 0 && (
          <Card className="mb-6 border-2 border-warning-300 bg-gradient-to-r from-warning-50 to-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning-100">
                    <UserPlus className="h-5 w-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="font-bold text-background-900 text-base">
                      {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-background-600">Review and accept or decline</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowRequests(!showRequests)}
                >
                  {showRequests ? "Hide" : "View Requests"}
                </Button>
              </div>

              {showRequests && (
                <div className="space-y-3 mt-4 pt-4 border-t-2 border-warning-200">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-background-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center text-white font-bold">
                          {request.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-background-900 text-sm">{request.user.name}</p>
                          <p className="text-xs text-background-500">{request.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleRequestAction(request.id, "reject")}
                          disabled={requestFetcher.state === "submitting"}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleRequestAction(request.id, "accept")}
                          disabled={requestFetcher.state === "submitting"}
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Alert Message */}
        {actionData?.message && (
          <div className={`p-4 rounded-xl text-base mb-6 flex items-center gap-3 ${
            actionData.success
              ? "bg-success-50 text-success-700 border-2 border-success-200"
              : "bg-error-50 text-error-700 border-2 border-error-200"
          }`}>
            {actionData.success ? <Check className="h-5 w-5" /> : null}
            {actionData.message}
          </div>
        )}

        {/* Share Group Code - Only for members */}
        {isMember && (
          <Card className="mb-6 border-2 border-primary-300 bg-gradient-to-r from-primary-50 to-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-100">
                  <Share2 className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-background-900 mb-1 text-base">Share this group</p>
                  <p className="text-sm text-background-700 mb-4">
                    Share this code with classmates so they can request to join your group
                  </p>
                  <div className="flex gap-3">
                    <code className="flex-1 px-4 py-3 bg-white border-2 border-background-300 rounded-xl text-sm font-mono text-background-900 overflow-hidden text-ellipsis font-semibold">
                      {group.id}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={copyGroupCode}
                      className="shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join Request Banner - For non-members */}
        {!isMember && !isOwner && (
          <Card className="mb-6 border-2 border-primary-300 bg-gradient-to-r from-primary-50 to-white shadow-sm">
            <CardContent className="p-6">
              {group.hasPendingRequest ? (
                <Form method="post" className="flex items-center justify-between">
                  <input type="hidden" name="intent" value="cancel-request" />
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning-100">
                      <Clock className="h-6 w-6 text-warning-600" />
                    </div>
                    <div>
                      <p className="font-bold text-background-900 text-base">Request Pending</p>
                      <p className="text-sm text-background-700">Waiting for the group owner to approve your request</p>
                    </div>
                  </div>
                  <Button type="submit" variant="outline" size="md" disabled={isSubmitting}>
                    {isSubmitting ? "Cancelling..." : "Cancel Request"}
                  </Button>
                </Form>
              ) : (
                <Form method="post" className="flex items-center justify-between">
                  <input type="hidden" name="intent" value="request-join" />
                  <div>
                    <p className="font-bold text-background-900 text-base">Request to join this study group</p>
                    <p className="text-sm text-background-700">The group owner will review your request</p>
                  </div>
                  <Button type="submit" size="md" disabled={isSubmitting}>
                    {isSubmitting ? "Requesting..." : "Request to Join"}
                  </Button>
                </Form>
              )}
            </CardContent>
          </Card>
        )}

        {isMember && !isOwner && (
          <Card className="mb-6 border-2 border-background-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <Form method="post" className="flex items-center justify-between">
                <input type="hidden" name="intent" value="leave" />
                <div>
                  <p className="font-bold text-background-900 text-base">You're a member of this group</p>
                  <p className="text-sm text-background-700">You can leave anytime</p>
                </div>
                <Button type="submit" variant="danger" size="md" disabled={isSubmitting}>
                  {isSubmitting ? "Leaving..." : "Leave Group"}
                </Button>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members - Full width on mobile, 2 cols on desktop */}
          <Card className="lg:col-span-2 border-2 border-background-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Users className="h-5 w-5 text-primary-600" />
                Members ({group.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.members.length === 0 ? (
                <p className="text-center text-background-500 py-8 text-base">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {group.members.map((member: { id: string; name: string; email: string; joinedAt: Date }) => (
                    <div key={member.id} className="flex items-center gap-3 p-4 rounded-xl hover:bg-background-50 transition-colors border border-background-100">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-background-900 text-base">{member.name}</p>
                        <p className="text-xs text-background-500">{member.email}</p>
                      </div>
                      {member.id === group.ownerId && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                          <Crown className="h-3.5 w-3.5" />
                          Owner
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Files */}
            <Card className="border-2 border-background-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-background-300 mx-auto mb-3" />
                  <p className="text-sm text-background-600">File sharing coming soon</p>
                </div>
              </CardContent>
            </Card>

            {/* Sessions */}
            <Card className="border-2 border-background-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-background-300 mx-auto mb-3" />
                  <p className="text-sm text-background-600">Study sessions coming soon</p>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="border-2 border-background-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <MessageSquare className="h-5 w-5 text-primary-600" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-background-300 mx-auto mb-3" />
                  <p className="text-sm text-background-600">Group chat coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
