import { Link } from "react-router";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-background-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 rounded-lg bg-primary-600">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-background-900">StudyBuddy</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-background-700 hover:text-primary-600 px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-medium bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
