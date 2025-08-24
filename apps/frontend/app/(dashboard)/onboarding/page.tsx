"use client";

import { Box, Button, Container, Heading, Input, Select, Stack, Text, Textarea, useToast } from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const { user } = useUser();
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, [user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!user) return;
    setLoading(true);

    try {
      // Capture onboarding answers in PostHog
      posthog.capture("onboarding_submitted", {
        role,
        use_case: useCase,
        goal,
      });

      toast({ title: "Thanks! You're all set.", status: "success" });
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
            <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Stack>
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select placeholder="I am a..." value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="individual">Privacy-conscious individual</option>
            <option value="small_business">Small business owner</option>
            <option value="compliance_officer">Compliance officer</option>
            <option value="legal_team">Legal team</option>
            <option value="other">Other</option>
          </Select>
          <Select placeholder="I want to use Toast AI to..." value={useCase} onChange={(e) => setUseCase(e.target.value)}>
            <option value="analyze_privacy_policies">Understand privacy policies</option>
            <option value="vendor_risk">Assess vendor and contract risk</option>
            <option value="monitor_changes">Monitor policy changes</option>
            <option value="bulk_review">Bulk review for legal team</option>
          </Select>
          <Textarea placeholder="What success looks like for you" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <Button type="submit" colorScheme="purple" isLoading={loading} loadingText="Saving...">Continue</Button>
        </Stack>
      </Box>
    </Container>
  );
}
