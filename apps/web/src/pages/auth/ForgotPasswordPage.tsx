import * as React from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { FormField } from "./FormField";

export default function ForgotPasswordPage() {
  const { sendResetLink } = useApp();
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSend = () => {
    const result = sendResetLink(email);
    if (!result.ok && result.errors) setErrors(result.errors);
  };

  return (
    <AuthLayout>
      <div className="font-display mb-1 text-[20px] font-bold">Reset your password</div>
      <div className="mb-[22px] text-[13px] leading-[1.5] text-ink-3">
        Enter your email and we'll send a reset link. Requests are limited to 5 per hour.
      </div>

      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} />

      <Button onClick={handleSend} className="w-full">
        Send reset link
      </Button>
      <div className="mt-[18px] text-center text-[12px] text-ink-3">
        <Link to="/login">Back to log in</Link>
      </div>
    </AuthLayout>
  );
}
