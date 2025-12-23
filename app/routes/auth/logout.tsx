import { redirect } from "react-router";
import type { Route } from "./+types/logout";

export async function loader({ request }: Route.LoaderArgs) {
  // Call logout API
  try {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    });
  } catch {
    // Continue with redirect even if API call fails
  }

  return redirect("/auth/login");
}

export default function LogoutPage() {
  return null;
}
