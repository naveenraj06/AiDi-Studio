import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { FormField } from "./FormField";

export default function ResetPasswordPage() {
  const { resetPassword, isPasswordRecovery } = useAuth();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  const handleReset = async () => {
    setPending(true);
    setErrors({});
    const result = await resetPassword(password, confirmPassword);
    setPending(false);
    if (!result.ok && result.errors) setErrors(result.errors);
  };

  if (!isPasswordRecovery) {
    return (
      <AuthLayout>
        <div className="font-display mb-2 text-[20px] font-bold">Link expired</div>
        <div className="mb-5 text-[13px] leading-[1.6] text-ink-2">
          This password reset link is invalid or has expired. Request a new one to continue.
        </div>
        <Link to="/forgot-password">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="font-display mb-1 text-[20px] font-bold">Set a new password</div>
      <div className="mb-[22px] text-[13px] text-ink-3">This reset link is single-use.</div>

      <FormField
        label="New password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 8 characters"
        error={errors.password}
      />
      <FormField
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        error={errors.confirmPassword}
      />

      <Button onClick={handleReset} disabled={pending} className="mt-2 w-full">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </AuthLayout>
  );
}
