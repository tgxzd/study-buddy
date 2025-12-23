import { Form, useActionData, useNavigation, redirect, useLoaderData } from "react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { BookOpen } from "lucide-react";
import type { Route } from "./+types/login";
import { loginUser } from "../../server/services/authService.js";
import { loginSchema } from "../../server/utils/validation.js";
import { serializeCookie, getAuthCookieOptions, getCookieName } from "../../server/utils/cookie.js";
import { verifyToken } from "../../server/config/jwt.js";
import { prisma } from "../../server/config/database.js";

interface ActionData {
  success?: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - StudyBuddy" },
    { name: "description", content: "Sign in to your StudyBuddy account" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return {};
  }

  try {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const authCookie = cookies.find((c) => c.startsWith(`${getCookieName()}=`));

    if (!authCookie) {
      return {};
    }

    const token = authCookie.split("=")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return {};
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (user) {
      return redirect("/dashboard");
    }
  } catch {
    // Continue to login page
  }

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  try {
    const { token } = await loginUser({ email, password });
    const cookieOptions = getAuthCookieOptions();
    const cookieHeader = serializeCookie(getCookieName(), token, cookieOptions);

    return redirect("/dashboard", {
      headers: { "Set-Cookie": cookieHeader },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid email or password") {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-background-900 mb-1">Welcome back</h1>
          <p className="text-background-600 text-sm">Sign in to continue to StudyBuddy</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form method="post" className="space-y-4">
              {actionData?.message && (
                <div className={`p-3 rounded-lg text-sm ${
                  actionData.success
                    ? "bg-success-50 text-success-700"
                    : "bg-error-50 text-error-700"
                }`}>
                  {actionData.message}
                </div>
              )}

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                error={actionData?.errors?.find((e) => e.field === "email")?.message}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                error={actionData?.errors?.find((e) => e.field === "password")?.message}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-background-600">
                Don't have an account?{" "}
                <a href="/auth/register" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign up
                </a>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
