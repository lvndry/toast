import { SignUp } from "@clerk/nextjs";
import { Column, Heading, Text } from "@once-ui-system/core";

export default function SignUpPage() {
  return (
    <Column fillWidth fillHeight horizontal="center" align="center" padding="xl">
      <Column gap="l" horizontal="center" style={{ maxWidth: "400px" }}>
        <Column horizontal="center" gap="m" align="center">
          <Heading variant="display-strong-l">Join ToastAI</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Create your account to start analyzing legal documents
          </Text>
        </Column>
        <SignUp
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
