import type { Route } from "./+types/home";
import { Button } from "../components/ui/Button";
import { Link } from "react-router";
import { BookOpen, Users, FileText, Calendar } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "StudyBuddy - Learn Together, Succeed Together" },
    { name: "description", content: "A simple platform for students to collaborate, share notes, schedule study sessions, and track group progress." },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background-50 px-4 py-20 md:py-32">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-background-900 mb-4">
            Learn Together, Succeed Together
          </h1>
          <p className="text-lg text-background-600 mb-8 max-w-xl mx-auto">
            Collaborate with classmates, share notes, and schedule study sessions in one simple platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="secondary">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-background-900 mb-3">
              Everything You Need
            </h2>
            <p className="text-background-600">
              Simple tools for effective study collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-background-200 bg-white">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-background-900 mb-2">Study Groups</h3>
              <p className="text-sm text-background-600">
                Create or join groups for your courses
              </p>
            </div>

            <div className="p-6 rounded-xl border border-background-200 bg-white">
              <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="font-semibold text-background-900 mb-2">Share Notes</h3>
              <p className="text-sm text-background-600">
                Upload and share study materials
              </p>
            </div>

            <div className="p-6 rounded-xl border border-background-200 bg-white">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-success-600" />
              </div>
              <h3 className="font-semibold text-background-900 mb-2">Schedule Sessions</h3>
              <p className="text-sm text-background-600">
                Plan and organize group study meetups
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-background-200">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-1 rounded-md bg-primary-600">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-background-900">StudyBuddy</span>
          </div>
          <p className="text-sm text-background-500">
            &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
