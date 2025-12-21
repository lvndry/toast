"use client";

import { Gavel } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

import { useAnalytics } from "../../../hooks/useAnalytics";
import { useUserData } from "../../../hooks/useUserData";
import { posthog } from "../../../lib/analytics";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { trackUserJourney } = useAnalytics();
  const { userData, loading: userDataLoading } = useUserData();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    // Track onboarding start
    trackUserJourney.onboardingStarted();

    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");

      // Identify user in PostHog early
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
      });

      // Ensure user exists in backend
      void fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
        }),
      }).catch(() => {});
    }
  }, [user, trackUserJourney]);

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (!userDataLoading && userData?.onboarding_completed) {
      router.push("/companies");
    }
  }, [userData, userDataLoading, router]);

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!role) {
      newErrors.role = "Please select your role";
    }

    if (!useCase) {
      newErrors.useCase = "Please select how you want to use Clausea";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !loading) {
      event.preventDefault();
      void handleSubmit(event as any);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!user) return;

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Capture onboarding answers in PostHog
      posthog.capture("onboarding_submitted", {
        role,
        use_case: useCase,
        goal,
      });

      // Mark onboarding completed in backend
      await fetch("/api/users/complete-onboarding", { method: "POST" });

      // Track onboarding completion
      trackUserJourney.onboardingCompleted({
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        role,
        use_case: useCase,
        goal,
      });

      router.push("/companies");
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  }

  // Show loading while checking user data
  if (userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 border border-white/10 rounded-xl flex items-center justify-center animate-pulse">
            <Gavel className="w-6 h-6 text-secondary" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary/40">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render form if user has completed onboarding (redirect will happen)
  if (userData?.onboarding_completed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 border border-white/10 rounded-xl flex items-center justify-center">
              <Gavel className="w-6 h-6 text-secondary" />
            </div>
            <span className="font-display font-bold text-3xl tracking-tighter text-primary">
              LegalLens{" "}
              <span className="text-secondary font-serif italic font-normal tracking-normal">
                AI
              </span>
            </span>
          </div>
          <h1 className="font-display font-bold text-5xl tracking-tighter text-primary mb-4">
            Tell us about you
          </h1>
          <p className="text-lg text-primary/60 max-w-md mx-auto">
            This helps tailor legal analysis to your needs and deliver insights
            that matter to you.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-background/20 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
                  First Name
                </label>
                <Input
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 rounded-xl bg-background/40 border-white/10 focus:border-secondary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
                  Last Name
                </label>
                <Input
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 rounded-xl bg-background/40 border-white/10 focus:border-secondary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
                Email
              </label>
              <Input
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "h-12 rounded-xl bg-background/40 border-white/10 focus:border-secondary/50",
                  errors.email && "border-red-500/50 focus:border-red-500",
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
                I am a...
              </label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "h-12 rounded-xl bg-background/40 border-white/10 focus:border-secondary/50",
                  errors.role && "border-red-500/50 focus:border-red-500",
                )}
              >
                <option value="">Select your role</option>
                <option value="individual">Privacy-conscious individual</option>
                <option value="founder">Founder</option>
                <option value="compliance_officer">Compliance officer</option>
                <option value="legal_team">Legal team</option>
                <option value="other">Other</option>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-2">{errors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
                I want to use Clausea to...
              </label>
              <Select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "h-12 rounded-xl bg-background/40 border-white/10 focus:border-secondary/50",
                  errors.useCase && "border-red-500/50 focus:border-red-500",
                )}
              >
                <option value="">Select your use case</option>
                <option value="analyze_privacy_policies">
                  Understand privacy policies
                </option>
                <option value="vendor_risk">
                  Assess vendor and contract risk
                </option>
                <option value="monitor_changes">Monitor policy changes</option>
                <option value="bulk_review">Bulk review for legal team</option>
              </Select>
              {errors.useCase && (
                <p className="text-red-500 text-sm mt-2">{errors.useCase}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">
                Tell us about your goals and what you hope to achieve...
              </label>
              <Textarea
                placeholder="What are your priorities, how could Clausea help you?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] rounded-xl bg-background/40 border-white/10 focus:border-secondary/50 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full h-14 font-bold uppercase tracking-widest bg-secondary text-primary hover:bg-secondary/80 shadow-lg shadow-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
