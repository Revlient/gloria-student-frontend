"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  deleteAccount as apiDeleteAccount,
  logout as apiLogout,
  isAuthenticated,
  getUserIdFromAccessToken,
  clearTokens,
} from "../../src/lib/api";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  LogOut,
  RefreshCcw,
  Trash2,
  Mail,
  Phone,
  Fingerprint,
  User,
  Building,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const qc = useQueryClient();

  // local UI state
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      clearTokens();
      router.push("/");
    }
  }, [router]);

  // Fetch current user details
  const {
    data: userData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      return await getCurrentUser();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutation to delete account
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const userIdFromToken = getUserIdFromAccessToken();
      const userId =
        userIdFromToken ?? userData?.id ?? userData?.user?.id ?? null;
      if (!userId) throw new Error("Unable to determine user id to delete.");
      return await apiDeleteAccount(userId);
    },
    onSuccess: () => {
      clearTokens();
      qc.clear();
      router.push("/");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setLocalError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to delete account. Please try again.",
      );
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiLogout();
      } catch {
        // ignore server errors
      }
    },
    onSettled: () => {
      clearTokens();
      qc.clear();
      router.push("/");
    },
  });

  function onConfirmDelete() {
    setLocalError(null);
    deleteMutation.mutate();
    setShowConfirm(false);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 p-4">
        <Card className="w-full max-w-md animate-pulse border-none shadow-lg">
          <div className="h-32 bg-slate-200 dark:bg-neutral-800 rounded-t-lg" />
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-slate-300 dark:bg-neutral-700 ring-4 ring-background" />
            </div>
            <div className="space-y-3 text-center">
              <div className="h-6 w-1/2 mx-auto bg-slate-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-1/3 mx-auto bg-slate-100 dark:bg-neutral-900 rounded" />
            </div>
            <div className="mt-8 space-y-4">
              <div className="h-10 w-full bg-slate-100 dark:bg-neutral-900 rounded" />
              <div className="h-10 w-full bg-slate-100 dark:bg-neutral-900 rounded" />
            </div>
          </div>
        </Card>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold">Unable to load profile</h2>
          <p className="mt-2 text-sm text-muted-foreground mb-6">
            We couldn&apos;t fetch your student data.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Retry
          </Button>
        </Card>
      </main>
    );
  }

  const user = userData?.user ?? userData ?? null;
  const fullName =
    user?.full_name ??
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ??
    "Student";
  const email = user?.email ?? "No email provided";
  const phone = user?.phone_number ?? user?.phone ?? "No phone provided";
  const profilePic = user?.profile_pic ?? user?.passport_photo ?? null;
  const createdBy = userData?.created_by ?? null;
  const companyName = userData?.company_name ?? null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your student account settings.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 hidden sm:flex"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>

        <Card className="overflow-hidden border-slate-200 dark:border-neutral-800 shadow-md">
          {/* Decorative Top Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 relative">
            {/* Optional pattern overlay could go here */}
          </div>

          <CardHeader className="relative px-6 pb-2">
            <div className="-mt-16 mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                <AvatarImage
                  src={profilePic || "/default-profile.png"}
                  alt="Profile Picture"
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl bg-slate-100 dark:bg-neutral-800">
                  {fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 text-center sm:text-left pb-2">
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="secondary" className="font-normal">
                    Student
                  </Badge>
                </div>
              </div>
              {/* Mobile Refresh Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className="absolute top-4 right-4 sm:hidden text-white hover:bg-white/20 hover:text-white"
              >
                <RefreshCcw
                  className={`h-5 w-5 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 py-6">
            {/* Contact Information Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" /> Email Address
                </div>
                <div className="pl-6 text-sm font-medium">{email}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" /> Phone Number
                </div>
                <div className="pl-6 text-sm font-medium">{phone}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Fingerprint className="h-4 w-4" /> Created By
                </div>
                <div className="pl-6">
                  <div className="flex items-center text-foreground gap-2 text-sm font-medium">
                    {createdBy}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building className="h-4 w-4" /> Company Name
                </div>
                <div className="pl-6">
                  <div className="flex items-center text-foreground gap-2 text-sm font-medium">
                    {companyName}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="bg-slate-50/50 dark:bg-neutral-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
            </Button>

            <Button
              variant="ghost"
              className="w-full sm:w-auto gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                setLocalError(null);
                setShowConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[425px] bottom-0 top-auto translate-y-0 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto w-screen">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Delete Account?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to permanently delete your account?
              <br />
              <span className="font-medium text-foreground">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>

          {localError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center">
              {localError}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
