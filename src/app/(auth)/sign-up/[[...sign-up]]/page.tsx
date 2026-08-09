import { SignUp } from "@clerk/nextjs";
import { AsciiField } from "@/components/ui/ascii-field";
import { Logo } from "@/components/ui/logo";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-background py-12">
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, black 100%)",
        }}
      >
        <AsciiField />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <Logo size={40} />
        <p className="eyebrow-mono">Start your project</p>
      </div>
      <div className="relative">
        <SignUp />
      </div>
    </div>
  );
}
