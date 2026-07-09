import * as React from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { FormField } from "./FormField";

export default function ResetPasswordPage() {
  const { resetPassword } = useApp();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleReset = () => {
    const result = resetPassword(password, confirmPassword);
    if (!result.ok && result.errors) setErrors(result.errors);
  };

  return (
    <AuthLayout>
      <div className="font-display mb-1 text-[20px] font-bold">Set a new password</div>
      <div className="mb-[22px] text-[13px] text-ink-3">This reset link is valid for 1 hour and single-use.</div>

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

      <Button onClick={handleReset} className="mt-2 w-full">
        Update password
      </Button>
    </AuthLayout>
  );
}
