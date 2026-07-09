import { Link, useNavigate } from "react-router-dom";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-0 px-6">
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-brand-violet/8 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-72 w-72 rounded-full bg-brand-cyan/6 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-border-strong bg-bg-1 shadow-2xl lg:grid-cols-2">
        <div className="p-9">
          <Logo size={22} className="mb-8" />
          <h2 className="text-2xl font-bold text-ink-1">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-2">Sign in to your account</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/app/projects");
            }}
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-2">Email address</label>
              <Input type="email" placeholder="you@company.com" defaultValue="naveenraj@company.com" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-ink-2">Password</label>
                <span className="text-[11px] text-brand-violetLight cursor-pointer">Forgot password?</span>
              </div>
              <Input type="password" placeholder="••••••••••••" defaultValue="password123" />
            </div>
            <label className="flex items-center gap-2 text-xs text-ink-2">
              <input type="checkbox" className="h-3.5 w-3.5 accent-brand-violet" />
              Remember me
            </label>
            <Button type="submit" className="w-full" size="lg">Sign in</Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-ink-3">Or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary">Google</Button>
            <Button variant="secondary">GitHub</Button>
          </div>

          <p className="mt-6 text-center text-xs text-ink-3">
            Don't have an account? <span className="text-brand-violetLight cursor-pointer">Sign up →</span>
          </p>
        </div>

        <div className="relative hidden items-center justify-center bg-bg-2 p-9 lg:flex">
          <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-brand-violet/10 blur-3xl" />
          <div className="pointer-events-none absolute right-10 bottom-16 h-40 w-40 rounded-full bg-brand-cyan/10 blur-2xl" />
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-8 h-24 w-24 rotate-45 rounded-2xl bg-brand-violet/25" />
            <h3 className="text-lg font-bold text-ink-1">
              The analytics platform<br /><span className="text-brand-violet">built for modern teams.</span>
            </h3>
            <p className="mt-8 text-[11px] text-ink-3">© 2026 AiDi Studio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
