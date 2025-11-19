import React, { JSX } from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShieldCheck,
  UserCircle,
  Lock,
  UserX,
  Scale,
  FileText,
  Mail,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Gloria Student Portal",
  description: "Terms and conditions for Gloria Student portal",
};

export default function TermsPage(): JSX.Element {
  const currentYear = new Date().getFullYear();

  // Helper for smooth scrolling to anchor tags
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-neutral-950 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
          <Badge variant="outline">v1.0</Badge>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* --- LEFT COLUMN: Sticky Sidebar (Navigation & Context) --- */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 relative">
            <div className="sticky top-8 space-y-6">
              {/* Back Button */}
              <div>
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="gap-2 -ml-4 text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>

              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    v1.0
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Terms &amp; <br /> Conditions
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Please read these terms carefully before using the Gloria
                  Student Portal.
                </p>
              </div>

              <Separator />

              {/* Table of Contents / Quick Nav */}
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-2">
                  Contents
                </p>
                {[
                  { id: "intro", label: "Welcome", icon: BookOpen },
                  {
                    id: "account",
                    label: "1. Account & Auth",
                    icon: UserCircle,
                  },
                  {
                    id: "privacy",
                    label: "2. Data & Privacy",
                    icon: ShieldCheck,
                  },
                  { id: "deletion", label: "3. Account Deletion", icon: UserX },
                  { id: "usage", label: "4. Acceptable Use", icon: Lock },
                  { id: "changes", label: "5. Changes to Terms", icon: Scale },
                ].map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md transition-colors group text-left"
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                      {item.label}
                    </span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </nav>

              {/* Footer Info */}
              <div className="pt-6 text-xs text-muted-foreground">
                <p>© {currentYear} Gloria Student Portal.</p>
                <p className="mt-1">Last updated: November 2024</p>
              </div>
            </div>
          </aside>

          {/* --- RIGHT COLUMN: Main Content --- */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Card className="border-none shadow-md ring-1 ring-slate-200 dark:ring-neutral-800 overflow-hidden">
              {/* Mobile-only Title within card */}
              <CardHeader className="lg:hidden bg-slate-50/50 dark:bg-neutral-900/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Terms & Conditions
                </CardTitle>
                <CardDescription>
                  Effective Date: November 24, 2024
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 md:p-10 space-y-12">
                {/* Intro Section */}
                <section id="intro" className="scroll-mt-24 space-y-4">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Welcome
                  </h2>
                  <p className="text-muted-foreground leading-7 text-lg">
                    These Terms &amp; Conditions govern your use of the Gloria
                    Student portal. By accessing or using the portal, you agree
                    to be bound by these terms.
                  </p>
                </section>

                <Separator />

                {/* Section 1 */}
                <section
                  id="account"
                  className="scroll-mt-24 grid md:grid-cols-[40px_1fr] gap-4"
                >
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <UserCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">
                      1. Account and Authentication
                    </h3>
                    <p className="text-muted-foreground leading-7">
                      Students must register and authenticate using valid
                      credentials. Access to profile and other protected pages
                      requires a valid JWT issued by the backend. Do not share
                      your account credentials with others to maintain the
                      security of your academic data.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 text-sm text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> The institution is not liable for
                      data breaches caused by shared passwords.
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section
                  id="privacy"
                  className="scroll-mt-24 grid md:grid-cols-[40px_1fr] gap-4"
                >
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">
                      2. Data &amp; Privacy
                    </h3>
                    <p className="text-muted-foreground leading-7">
                      We respect your privacy. Personal information stored in
                      your profile will be handled according to the
                      institution&apos;s privacy policy. The application may
                      call backend services to read and update profile data
                      solely for educational purposes.
                    </p>
                  </div>
                </section>

                {/* Section 3 */}
                <section
                  id="deletion"
                  className="scroll-mt-24 grid md:grid-cols-[40px_1fr] gap-4"
                >
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                      <UserX className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                      3. Deleting Your Account
                    </h3>
                    <p className="text-muted-foreground leading-7">
                      If you choose to delete your account, the portal provides
                      an option to permanently remove your user and associated
                      student profile.
                    </p>
                    <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 pl-6 italic text-muted-foreground">
                      This action is irreversible and will result in the
                      complete loss of access history.
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section
                  id="usage"
                  className="scroll-mt-24 grid md:grid-cols-[40px_1fr] gap-4"
                >
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Lock className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">4. Acceptable Use</h3>
                    <p className="text-muted-foreground leading-7">
                      You are responsible for all activity that occurs under
                      your account. Do not use the portal for unlawful
                      activities, attempt to breach security protocols, or
                      harass other users.
                    </p>
                  </div>
                </section>

                {/* Section 5 */}
                <section
                  id="changes"
                  className="scroll-mt-24 grid md:grid-cols-[40px_1fr] gap-4"
                >
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Scale className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">
                      5. Changes to Terms
                    </h3>
                    <p className="text-muted-foreground leading-7">
                      These terms may be updated from time to time. Continued
                      use of the portal after changes indicates acceptance of
                      the updated terms. Major changes will be communicated via
                      notification.
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                {/* Contact Box */}
                <div className="bg-slate-50 dark:bg-neutral-900 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-background p-3 rounded-full shadow-sm">
                      <Mail className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Still have questions?</h4>
                      <p className="text-sm text-muted-foreground">
                        Our support team is here to help clarify any points.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Contact Support</Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Footer */}
            <div className="lg:hidden mt-8 text-center text-sm text-muted-foreground">
              <p>© {currentYear} Gloria Student Portal.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
