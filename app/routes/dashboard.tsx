import { useLoaderData, redirect, Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Users, FileText, Calendar, LogOut, User } from "lucide-react";
import type { Route } from "./+types/dashboard";
import { verifyToken } from "../server/config/jwt.js";
import { prisma } from "../server/config/database.js";
import { getCookieName } from "../server/utils/cookie.js";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - StudyBuddy" },
    { name: "description", content: "Your StudyBuddy dashboard" },
  ];
}

interface LoaderData {
  user: UserResponse;
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

    return { user };
  } catch {
    return redirect("/auth/login");
  }
}

export default function DashboardPage() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-background-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-background-900">
              Welcome, {user.name}
            </h1>
            <p className="text-background-600 text-sm">Manage your study groups and collaboration</p>
          </div>
          <Link to="/auth/logout">
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary-100">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-background-900">0</p>
                  <p className="text-sm text-background-600">Study Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent-100">
                  <FileText className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-background-900">0</p>
                  <p className="text-sm text-background-600">Shared Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success-100">
                  <Calendar className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-background-900">0</p>
                  <p className="text-sm text-background-600">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Get Started */}
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-background-600 mb-6">
              Create your first study group or join an existing one to start collaborating.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button>Create Study Group</Button>
              <Button variant="secondary">Browse Groups</Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-background-600">Name</p>
                <p className="font-medium text-background-900">{user.name}</p>
              </div>
              <div>
                <p className="text-background-600">Email</p>
                <p className="font-medium text-background-900">{user.email}</p>
              </div>
              <div>
                <p className="text-background-600">Role</p>
                <p className="font-medium text-background-900 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
