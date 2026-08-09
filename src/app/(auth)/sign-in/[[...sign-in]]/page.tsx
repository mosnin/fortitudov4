import { SignIn } from "@clerk/nextjs";
import { AsciiField } from "@/components/ui/ascii-field";
import { Logo } from "@/components/ui/logo";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-background">
      {/* Studio atmosphere — the ASCII field breathes behind the card */}
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
        <p className="eyebrow-mono">Client portal</p>
      </div>
      <div className="relative">
        <SignIn />
      </div>
    </div>
  );
}
