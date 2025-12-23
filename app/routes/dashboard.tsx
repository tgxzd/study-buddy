import { useLoaderData, redirect, Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Users, User } from "lucide-react";
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-background-900">
            Welcome back, {user.name || "Student"}!
          </h1>
          <p className="text-background-600 text-base mt-1">Manage your study groups and collaboration</p>
        </div>

        {/* Get Started */}
        <Card className="border-2 border-background-200 bg-white shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-background-700 mb-6 text-base">
              Create your first study group or join an existing one to start collaborating with classmates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/groups/create">
                <Button size="md">
                  <Users className="h-4 w-4 mr-2" />
                  Create Study Group
                </Button>
              </Link>
              <Link to="/groups">
                <Button variant="outline" size="md">
                  Browse Groups
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="border-2 border-background-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <User className="h-5 w-5 text-primary-600" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
              <div>
                <p className="text-background-600 mb-1">Name</p>
                <p className="font-semibold text-background-900">{user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-background-600 mb-1">Email</p>
                <p className="font-semibold text-background-900">{user.email}</p>
              </div>
              <div>
                <p className="text-background-600 mb-1">Role</p>
                <p className="font-semibold text-background-900 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
