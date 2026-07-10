import * as React from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { FormField } from "./FormField";

export default function SignupPage() {
  const { signup } = useApp();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  const handleSignup = async () => {
    setPending(true);
    setErrors({});
    const result = await signup({ name, email, password, confirmPassword });
    setPending(false);
    if (!result.ok && result.errors) setErrors(result.errors);
  };

  return (
    <AuthLayout>
      <div className="font-display mb-1 text-[20px] font-bold">Create your account</div>
      <div className="mb-[22px] text-[13px] text-ink-3">Free plan — no card required</div>

      <FormField label="Name" value={name} onChange={setName} placeholder="Jordan Reyes" error={errors.name} />
      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} />
      <FormField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 8 characters"
        error={errors.password}
      />
      <FormField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        error={errors.confirmPassword}
      />

      <Button onClick={handleSignup} disabled={pending} className="mt-2 w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <div className="mt-[18px] text-center text-[12px] text-ink-3">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </AuthLayout>
  );
}
