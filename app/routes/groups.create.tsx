import { Form, useActionData, useNavigation, redirect, useLoaderData, Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowLeft, Users, Sparkles, LayoutDashboard } from "lucide-react";
import type { Route } from "./+types/groups.create";
import { verifyToken } from "../server/config/jwt.js";
import { prisma } from "../server/config/database.js";
import { getCookieName } from "../server/utils/cookie.js";
import { createGroup } from "../server/services/groupService.js";

interface ActionData {
  success?: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Group - StudyBuddy" },
    { name: "description", content: "Create a new study group" },
  ];
}

interface LoaderData {
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

    return { userId: user.id };
  } catch {
    return redirect("/auth/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const userId = formData.get("userId") as string;

  if (!userId) {
    return { success: false, message: "User ID is required" };
  }

  try {
    const group = await createGroup({
      name,
      description,
      ownerId: userId,
    });

    return redirect(`/groups/${group.id}`);
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export default function CreateGroupPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const { userId } = useLoaderData<LoaderData>();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-background-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
          <span className="text-sm font-medium text-background-500">Create New Group</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-background-900">Create Study Group</h1>
          <p className="text-background-600 text-base mt-1">Start collaborating with classmates</p>
        </div>

        {/* Tips Card */}
        <Card className="mb-8 border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-sm text-background-700">
                <p className="font-bold text-background-900 mb-2 text-base">Tips for a great group</p>
                <ul className="space-y-1.5 text-background-600">
                  <li>• Use a clear, descriptive name</li>
                  <li>• Mention the subject or course</li>
                  <li>• Add a description to help others understand the purpose</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="border-2 border-background-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <Form method="post" className="space-y-6">
              <input type="hidden" name="userId" value={userId} />

              {actionData?.message && (
                <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                  actionData.success
                    ? "bg-success-50 text-success-700 border-2 border-success-200"
                    : "bg-error-50 text-error-700 border-2 border-error-200"
                }`}>
                  {actionData.message}
                </div>
              )}

              <div>
                <label className="block text-base font-semibold text-background-900 mb-3">
                  Group Name <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., CS101 Study Group"
                  required
                  maxLength={100}
                  className="flex h-12 w-full rounded-xl border-2 border-background-300 bg-white px-4 text-base text-background-900 transition-all duration-200 placeholder:text-background-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none shadow-sm"
                />
                <p className="text-xs text-background-500 mt-2">Max 100 characters</p>
              </div>

              <div>
                <label className="block text-base font-semibold text-background-900 mb-3">
                  Description <span className="text-background-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  placeholder="What is this group about? What will you study together?"
                  rows={4}
                  className="flex w-full rounded-xl border-2 border-background-300 bg-white px-4 py-3 text-base text-background-900 transition-all duration-200 placeholder:text-background-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none resize-none shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Link to="/groups" className="flex-1">
                  <Button type="button" variant="outline" size="md" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" size="md" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
