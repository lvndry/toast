"use client";

import { UserProfile } from "@clerk/nextjs";
import { Column, Heading, Text } from "@once-ui-system/core";

export default function ProfilePage() {
  return (
    <Column fillWidth fillHeight horizontal="center" align="center" padding="xl">
      <Column gap="l" horizontal="center" style={{ maxWidth: "800px" }}>
        <Column horizontal="center" gap="m" align="center">
          <Heading variant="display-strong-l">Your Profile</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Manage your account settings and preferences
          </Text>
        </Column>
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            }
          }}
        />
      </Column>
    </Column>
  );
}
