import { SignIn } from "@clerk/nextjs";
import { Column, Heading, Text } from "@once-ui-system/core";

export default function SignInPage() {
  return (
    <Column fillWidth fillHeight horizontal="center" align="center" padding="xl">
      <Column gap="l" horizontal="center" style={{ maxWidth: "400px" }}>
        <Column horizontal="center" gap="m" align="center">
          <Heading variant="display-strong-l">Welcome Back</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Sign in to your ToastAI account to continue
          </Text>
        </Column>
        <SignIn
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
