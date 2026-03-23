"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, CreditCard, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const handlePayment = () => {
    // In production, this would create a Creem.io checkout session
    // and redirect to the Creem checkout URL
    const creemCheckoutUrl = process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;
    if (creemCheckoutUrl) {
      window.location.href = `${creemCheckoutUrl}?metadata[projectId]=${projectId}`;
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
            alt="Fortitudo"
            width={48}
            height={48}
            className="rounded-lg mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>
            Secure payment processed through Creem.io
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Project setup</span>
              <span className="font-medium">Included</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Design & Development</span>
              <span className="font-medium">Included</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Testing & Launch</span>
              <span className="font-medium">Included</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Revision support</span>
              <span className="font-medium">Included</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-orange text-lg">Contact for quote</span>
            </div>
          </div>

          <Button
            variant="glow"
            size="lg"
            className="w-full"
            onClick={handlePayment}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Pay with Creem.io
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure, encrypted payment</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
