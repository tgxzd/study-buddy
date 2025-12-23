import { Link } from "react-router";
import { BookOpen, Users, LogOut, LayoutDashboard } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: "64px",
        backgroundColor: "#1f2937",
        borderBottom: "2px solid #374151",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
        display: "block",
        visibility: "visible",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem", height: "100%" }}>
        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ padding: "0.5rem", borderRadius: "0.75rem", backgroundColor: "#6B46C1", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)" }}>
              <BookOpen style={{ width: "1.25rem", height: "1.25rem", color: "#ffffff" }} />
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>StudyBuddy</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e5e7eb", padding: "0.625rem 1rem", textDecoration: "none", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6B46C1"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#e5e7eb"; }}
                >
                  <LayoutDashboard style={{ height: "1rem", width: "1rem" }} />
                  Dashboard
                </Link>
                <Link
                  to="/groups"
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e5e7eb", padding: "0.625rem 1rem", textDecoration: "none", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6B46C1"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#e5e7eb"; }}
                >
                  <Users style={{ height: "1rem", width: "1rem" }} />
                  Groups
                </Link>
                <Link
                  to="/auth/logout"
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f87171", padding: "0.625rem 1rem", textDecoration: "none", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem", transition: "all 0.2s", border: "1px solid #dc2626" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#dc2626"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#f87171"; }}
                >
                  <LogOut style={{ height: "1rem", width: "1rem" }} />
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e5e7eb", padding: "0.625rem 1rem", textDecoration: "none", borderRadius: "0.75rem", transition: "all 0.2s", border: "1px solid #4b5563" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#374151"; e.currentTarget.style.borderColor = "#6B46C1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "#4b5563"; }}
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  style={{ fontSize: "0.875rem", fontWeight: 600, backgroundColor: "#6B46C1", color: "#ffffff", padding: "0.625rem 1.25rem", textDecoration: "none", borderRadius: "0.75rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7c3aed"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#6B46C1"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.3)"; }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
