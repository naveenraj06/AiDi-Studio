import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Github, Mail, Lock, Check } from "lucide-react";
import { ActiveTab } from "../types";

interface SignInProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function SignIn({ onNavigate }: SignInProps) {
  const [email, setEmail] = useState("alex.morgan@company.com");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNavigate("projects");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans flex items-center justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container splits into 2 columns on desktop */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-[#0c101b] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden mx-4 relative z-10">
        
        {/* Left: Sign In Form */}
        <div className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <button
              onClick={() => onNavigate("landing")}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 transition-colors"
              id="back-to-home-btn"
            >
              ← Back to homepage
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-mono font-bold text-white">0S</div>
              <span className="font-sans font-bold text-lg text-white">AiDi Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0e1424] border border-slate-800/80 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="name@company.com"
                  required
                  id="signin-email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0e1424] border border-slate-800/80 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  required
                  id="signin-password-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="sr-only"
                    id="signin-remember-checkbox"
                  />
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${rememberMe ? "bg-indigo-600 border-indigo-600" : "bg-[#0e1424] border-slate-800"}`}>
                    {rememberMe && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors select-none">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
              id="signin-submit-btn"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/80" />
            </div>
            <span className="relative bg-[#0c101b] px-3 text-xs text-slate-500 uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("projects")}
              className="bg-[#0e1424] hover:bg-[#131b30] border border-slate-800/80 hover:border-slate-700 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
              id="signin-google-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => onNavigate("projects")}
              className="bg-[#0e1424] hover:bg-[#131b30] border border-slate-800/80 hover:border-slate-700 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
              id="signin-github-btn"
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <a href="#signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Right: Abstract Volumetric Shape Illustration */}
        <div className="hidden md:col-span-6 bg-[#04060a] relative flex items-center justify-center overflow-hidden border-l border-slate-800/40 p-12 select-none">
          {/* Glowing orb background */}
          <div className="absolute w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
          
          {/* 3D Mockup Block Container */}
          <div className="relative flex flex-col items-center text-center z-10 max-w-sm">
            {/* Volumetric block mockup using CSS shapes with shadow and hover animation */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-48 h-48 mb-10 flex items-center justify-center"
            >
              {/* Outer neon ring */}
              <div className="absolute inset-0 rounded-full border border-indigo-500/20 blur-[1px] animate-pulse" />
              
              {/* Volumetric Floating Shape (using beautiful layered divs representing the stylized block from the image) */}
              <div className="absolute w-28 h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl transform rotate-[25deg] shadow-[15px_15px_40px_rgba(79,70,229,0.3)] flex items-center justify-center border border-indigo-400/30">
                <div className="w-20 h-28 bg-white/10 rounded-xl backdrop-blur-md border border-white/10" />
              </div>
              <div className="absolute w-24 h-24 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-xl transform -rotate-[15deg] translate-x-12 translate-y-10 shadow-lg border border-teal-300/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#04060a]/20 rounded-lg backdrop-blur-md" />
              </div>
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-2">Build once, embed anywhere.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your data pipelines, create fully customized visual components, and dynamically stream dashboards to your clients in seconds.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
