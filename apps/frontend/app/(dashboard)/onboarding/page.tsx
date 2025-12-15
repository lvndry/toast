"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
      newErrors.useCase = "Please select how you want to use Toast AI";
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
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Loading...</h2>
      </div>
    );
  }

  // Don't render form if user has completed onboarding (redirect will happen)
  if (userData?.onboarding_completed) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Tell us about you</h2>
      <p className="text-muted-foreground mb-8">
        This helps tailor legal analysis to your needs.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.role ? "border-red-500" : ""}
          >
            <option value="">I am a...</option>
            <option value="individual">Privacy-conscious individual</option>
            <option value="founder">Founder</option>
            <option value="compliance_officer">Compliance officer</option>
            <option value="legal_team">Legal team</option>
            <option value="other">Other</option>
          </Select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role}</p>
          )}
        </div>
        <div>
          <Select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.useCase ? "border-red-500" : ""}
          >
            <option value="">I want to use Toast AI to...</option>
            <option value="analyze_privacy_policies">
              Understand privacy policies
            </option>
            <option value="vendor_risk">Assess vendor and contract risk</option>
            <option value="monitor_changes">Monitor policy changes</option>
            <option value="bulk_review">Bulk review for legal team</option>
          </Select>
          {errors.useCase && (
            <p className="text-red-500 text-sm mt-1">{errors.useCase}</p>
          )}
        </div>
        <Textarea
          placeholder="What success looks like for you"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
