import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { FormField } from "./FormField";

export default function LoginPage() {
  const { login, loginWithOAuth } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  const handleLogin = async () => {
    setPending(true);
    setErrors({});
    const result = await login(email, password);
    setPending(false);
    if (!result.ok && result.errors) setErrors(result.errors);
  };

  return (
    <AuthLayout>
      <div className="font-display mb-1 text-[20px] font-bold">Log in</div>
      <div className="mb-[22px] text-[13px] text-ink-3">Welcome back to AiDi Studio</div>

      <div className="mb-[18px] flex flex-col gap-2">
        <button
          onClick={() => loginWithOAuth("google")}
          className="flex items-center justify-center gap-2 rounded-md border border-border-strong bg-bg-2 p-2.5 text-[13px] font-semibold text-ink-1 transition-colors hover:bg-bg-3"
        >
          <span>G</span> Continue with Google
        </button>
        <button
          onClick={() => loginWithOAuth("github")}
          className="flex items-center justify-center gap-2 rounded-md border border-border-strong bg-bg-2 p-2.5 text-[13px] font-semibold text-ink-1 transition-colors hover:bg-bg-3"
        >
          <span>⌥</span> Continue with GitHub
        </button>
      </div>

      <div className="my-[18px] flex items-center gap-2.5 text-[11px] text-ink-3">
        <div className="h-px flex-1 bg-border-strong" />
        OR
        <div className="h-px flex-1 bg-border-strong" />
      </div>

      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} />
      <FormField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        error={errors.password}
        rightSlot={
          <Link to="/forgot-password" className="text-[11px]">
            Forgot?
          </Link>
        }
      />

      <Button onClick={handleLogin} disabled={pending} className="mt-3 w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <div className="mt-[18px] text-center text-[12px] text-ink-3">
        No account? <Link to="/signup">Sign up</Link>
      </div>
    </AuthLayout>
  );
}
