"use client";

import { Box, Button, Container, Heading, Input, Select, Stack, Text, Textarea, useToast } from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAnalytics } from "../../../hooks/useAnalytics";
import { posthog } from "../../../lib/analytics";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();
  const { trackUserJourney } = useAnalytics();
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
      }).catch(() => { });
    }
  }, [user, trackUserJourney]);

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
      toast({
        title: "Please fill in all required fields",
        status: "error",
        duration: 3000,
      });
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

      toast({ title: "Thanks! You're all set.", status: "success" });
      router.push("/companies");
    } catch (error) {
      toast({ title: "Submission failed", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxW="container.md" py={12}>
      <Heading size="lg" mb={6}>Tell us about you</Heading>
      <Text color="gray.600" mb={8}>This helps tailor legal analysis to your needs.</Text>
      <Box as="form" onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
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
          </Stack>
          <Box>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              isInvalid={!!errors.email}
            />
            {errors.email && <Text color="red.500" fontSize="sm" mt={1}>{errors.email}</Text>}
          </Box>
          <Box>
            <Select
              placeholder="I am a..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={handleKeyDown}
              isInvalid={!!errors.role}
            >
              <option value="individual">Privacy-conscious individual</option>
              <option value="founder">Founder</option>
              <option value="compliance_officer">Compliance officer</option>
              <option value="legal_team">Legal team</option>
              <option value="other">Other</option>
            </Select>
            {errors.role && <Text color="red.500" fontSize="sm" mt={1}>{errors.role}</Text>}
          </Box>
          <Box>
            <Select
              placeholder="I want to use Toast AI to..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              onKeyDown={handleKeyDown}
              isInvalid={!!errors.useCase}
            >
              <option value="analyze_privacy_policies">Understand privacy policies</option>
              <option value="vendor_risk">Assess vendor and contract risk</option>
              <option value="monitor_changes">Monitor policy changes</option>
              <option value="bulk_review">Bulk review for legal team</option>
            </Select>
            {errors.useCase && <Text color="red.500" fontSize="sm" mt={1}>{errors.useCase}</Text>}
          </Box>
          <Textarea
            placeholder="What success looks like for you"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            colorScheme="purple"
            isLoading={loading}
            loadingText="Saving..."
          >
            Continue
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
