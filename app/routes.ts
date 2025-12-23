import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/root.tsx", [
    index("routes/home.tsx"),
    route("auth/login", "routes/auth/login.tsx"),
    route("auth/register", "routes/auth/register.tsx"),
    route("auth/logout", "routes/auth/logout.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
