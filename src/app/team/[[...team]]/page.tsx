import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/layout/auth-shell";

// Separate agency-staff entry point. After auth, staff land straight on the
// agency dashboard (the layout bounces anyone who isn't admin/team).
export default function TeamLoginPage() {
  return (
    <AuthShell tagline="Agency access — for the Fortitudo team.">
      <SignIn
        routing="path"
        path="/team"
        signUpUrl="/sign-up"
        forceRedirectUrl="/admin"
        fallbackRedirectUrl="/admin"
      />
    </AuthShell>
  );
}
