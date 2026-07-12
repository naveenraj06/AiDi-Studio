import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { FormField } from "./FormField";

export default function ForgotPasswordPage() {
  const { sendResetLink } = useAuth();
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  const handleSend = async () => {
    setPending(true);
    setErrors({});
    const result = await sendResetLink(email);
    setPending(false);
    if (!result.ok && result.errors) setErrors(result.errors);
  };

  return (
    <AuthLayout>
      <div className="font-display mb-1 text-[20px] font-bold">Reset your password</div>
      <div className="mb-[22px] text-[13px] leading-[1.5] text-ink-3">
        Enter your email and we'll send a reset link.
      </div>

      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} />

      <Button onClick={handleSend} disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <div className="mt-[18px] text-center text-[12px] text-ink-3">
        <Link to="/login">Back to log in</Link>
      </div>
    </AuthLayout>
  );
}
