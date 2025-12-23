import { Form, useActionData, useNavigation, redirect } from "react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { BookOpen } from "lucide-react";
import type { Route } from "./+types/register";
import { registerUser } from "../../server/services/authService.js";
import { registerSchema } from "../../server/utils/validation.js";
import { serializeCookie, getAuthCookieOptions, getCookieName } from "../../server/utils/cookie.js";

interface ActionData {
  success?: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - StudyBuddy" },
    { name: "description", content: "Create your StudyBuddy account" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords don't match" };
  }

  const result = registerSchema.safeParse({ name, email, password, confirmPassword });

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return { success: false, message: "Validation failed", errors };
  }

  try {
    const { user, token } = await registerUser({ name, email, password });
    const cookieOptions = getAuthCookieOptions();
    const cookieHeader = serializeCookie(getCookieName(), token, cookieOptions);

    return redirect("/dashboard", {
      headers: { "Set-Cookie": cookieHeader },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User with this email already exists") {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export default function RegisterPage() {
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
          <h1 className="text-2xl font-semibold text-background-900 mb-1">Create an account</h1>
          <p className="text-background-600 text-sm">Start learning together today</p>
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
                label="Full Name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                autoComplete="name"
                error={actionData?.errors?.find((e) => e.field === "name")?.message}
              />

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
                autoComplete="new-password"
                minLength={6}
                error={actionData?.errors?.find((e) => e.field === "password")?.message}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                error={actionData?.errors?.find((e) => e.field === "confirmPassword")?.message}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-background-600">
                Already have an account?{" "}
                <a href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign in
                </a>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
