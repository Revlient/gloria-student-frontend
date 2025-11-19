"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login as apiLogin } from "../src/lib/api";
import Link from "next/link";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

// Schema
const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof LoginSchema>) =>
      apiLogin(data.email, data.password),
    onSuccess: () => {
      router.push("/profile");
    },
    onError: () => {
      form.setError("root", {
        message: "Invalid credentials. Please check your email and password.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) =>
    mutation.mutate(values);

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* LEFT SIDE: Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white p-10 relative overflow-hidden">
        {/* 2. Background Image Implementation */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://plus.unsplash.com/premium_photo-1664443577542-06294d3354ff?q=80&w=2071&auto=format&fit=crop"
            alt="Campus background"
            fill
            priority
            className="object-cover object-center opacity-20 mix-blend-overlay"
          />
        </div>

        {/* Gradient Overlay (Optional, to ensure text readability over the image) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-2 font-bold text-xl">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span>Gloria Student Portal</span>
        </div>

        {/* Quote / Testimonial */}
        <div className="relative z-10 space-y-4 max-w-md">
          <blockquote className="text-lg font-medium leading-relaxed border-l-2 border-white/30 pl-4">
            Education is the passport to the future, for tomorrow belongs to
            those who prepare for it today.
          </blockquote>
          <div className="text-sm text-zinc-400">— Portal Administration</div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Gloria Institution. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form */}
      <div className="flex items-center justify-center bg-background py-12 px-10 min-h-screen">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your student credentials to access your dashboard.
            </p>
          </div>

          {/* Form Component */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Generic Error Alert */}
              {form.formState.errors.root && (
                <Alert
                  variant="destructive"
                  className="animate-in fade-in slide-in-from-top-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="student@gloria.edu"
                        type="email"
                        disabled={mutation.isPending}
                        className="bg-muted/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Password
                      <Link
                        href="#"
                        className="text-xs font-normal text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        Forgot password?
                      </Link>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={mutation.isPending}
                          className="bg-muted/30 pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Terms & Conditions
              </Link>
            </div>

            <p className="px-8 text-center text-xs text-muted-foreground">
              New here? Contact the{" "}
              <span className="font-medium text-foreground">
                Student Affairs Office
              </span>{" "}
              to activate your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
