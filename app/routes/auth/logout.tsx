import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { serializeClearCookie, getCookieName, getAuthCookieOptions } from "../../server/utils/cookie.js";

export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
  // Clear the auth cookie
  const clearCookie = serializeClearCookie(getCookieName(), getAuthCookieOptions());

  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": clearCookie,
    },
  });
}

export default function LogoutPage() {
  return null;
}
