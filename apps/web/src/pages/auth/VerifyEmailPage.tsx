import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";

export default function VerifyEmailPage() {
  const { pendingVerificationEmail, verifyEmail, resendVerification } = useApp();

  return (
    <AuthLayout>
      <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-bg-3 text-[20px]">✉️</div>
      <div className="font-display mb-2 text-[20px] font-bold">Verify your email</div>
      <div className="mb-5 text-[13px] leading-[1.6] text-ink-2">
        We sent a verification link to{" "}
        <strong className="text-ink-1">{pendingVerificationEmail || "your email"}</strong>. The link expires in 24
        hours. This is a prototype — click below to simulate clicking the email link.
      </div>
      <Button onClick={verifyEmail} className="w-full">
        Simulate: click verification link
      </Button>
      <div onClick={resendVerification} className="mt-4 cursor-pointer text-center text-[12px] text-brand-violet-light">
        Resend verification email
      </div>
    </AuthLayout>
  );
}
