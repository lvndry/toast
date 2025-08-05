import { SignIn } from "@clerk/nextjs";
import { Heading, Text } from "@once-ui-system/core";

export default function SignInPage() {
  return (
    <div className="w-full h-full flex justify-center items-center p-8">
      <div className="flex flex-col gap-6 justify-center items-center" style={{ maxWidth: "400px" }}>
        <div className="flex flex-col justify-center items-center gap-4">
          <Heading variant="display-strong-l">Welcome Back</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Sign in to your ToastAI account to continue
          </Text>
        </div>
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
      </div>
    </div>
  );
}
