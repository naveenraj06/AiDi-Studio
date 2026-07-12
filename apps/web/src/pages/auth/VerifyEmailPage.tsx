import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "./AuthLayout";

export default function VerifyEmailPage() {
  const { pendingVerificationEmail, resendVerification } = useAuth();
  const [resending, setResending] = React.useState(false);

  const handleResend = async () => {
    setResending(true);
    await resendVerification();
    setResending(false);
  };

  return (
    <AuthLayout>
      <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-bg-3 text-[20px]">✉️</div>
      <div className="font-display mb-2 text-[20px] font-bold">Verify your email</div>
      <div className="mb-5 text-[13px] leading-[1.6] text-ink-2">
        We sent a verification link to{" "}
        <strong className="text-ink-1">{pendingVerificationEmail || "your email"}</strong>. Click the link to
        finish creating your account — this page will move you along automatically once you do.
      </div>
      <div
        onClick={resending ? undefined : handleResend}
        className="cursor-pointer text-center text-[12px] text-brand-violet-light"
        style={resending ? { opacity: 0.6, pointerEvents: "none" } : undefined}
      >
        {resending ? "Resending…" : "Resend verification email"}
      </div>
    </AuthLayout>
  );
}
