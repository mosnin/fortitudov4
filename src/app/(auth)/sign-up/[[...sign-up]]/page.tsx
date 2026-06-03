import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/layout/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell tagline="Describe it. We'll build it.">
      <SignUp forceRedirectUrl="/welcome" />
    </AuthShell>
  );
}
