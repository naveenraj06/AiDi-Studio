import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Bot, Compass, Shield, Layers, HelpCircle, Code, Users } from "lucide-react";
import { ActiveTab } from "../types";

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans overflow-x-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Grids and Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090e]/80 border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-mono font-bold text-lg text-white">0S</span>
            </div>
            <span className="font-sans font-semibold tracking-tight text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AiDi Studio
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#dashboard-preview" className="hover:text-white transition-colors">Preview</a>
            <a href="#sdk" className="hover:text-white transition-colors">Developer SDK</a>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">v2.4.0</span>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("signin")}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              id="landing-signin-btn"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("projects")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98]"
              id="landing-getstarted-btn"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-inner"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              AI-NATIVE ANALYTICS PLATFORM
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight leading-[1.1] text-white mb-6"
            >
              Build Intelligent.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Embed Anywhere.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl"
            >
              Create reusable widgets, compose powerful dashboards, connect any data source,
              and embed analytics anywhere with our developer-first SDK. Real-time schema conversion and heavy data processing built-in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <button
                onClick={() => onNavigate("projects")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 group transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40"
                id="hero-getstarted-btn"
              >
                Go to Applet Studio
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#dashboard-preview"
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium px-6 py-3 rounded-lg transition-all"
                id="hero-demo-btn"
              >
                View Live Demo
              </a>
            </motion.div>

            {/* Quick Value Props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 w-full"
            >
              <div>
                <span className="block text-2xl font-bold text-white font-mono">99.9%</span>
                <span className="text-xs text-slate-400">Query Accuracy</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white font-mono">&lt; 10ms</span>
                <span className="text-xs text-slate-400">Response Time</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white font-mono">50k+</span>
                <span className="text-xs text-slate-400">Transformed/sec</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual Mockup (Right Side) */}
          <div className="lg:col-span-6 relative" id="dashboard-preview">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-2xl border border-slate-800/80 bg-[#0c101b] p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm overflow-hidden"
            >
              {/* Card top flare */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              
              {/* Header Widget */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 tracking-wider">LIVE REVENUE INSIGHTS</span>
                  <h3 className="text-lg font-bold text-white font-sans">Executive Sales Dashboard</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-semibold">
                  LIVE
                </span>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0e1424] p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs text-slate-400">Total Revenue</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">$98,346</div>
                  <span className="text-[10px] text-teal-400 font-medium flex items-center gap-1 mt-1">
                    ↑ 12.4% <span className="text-slate-400">vs last month</span>
                  </span>
                </div>
                <div className="bg-[#0e1424] p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs text-slate-400">Active Users</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">12,438</div>
                  <span className="text-[10px] text-teal-400 font-medium flex items-center gap-1 mt-1">
                    ↑ 8.2% <span className="text-slate-400">vs yesterday</span>
                  </span>
                </div>
              </div>

              {/* Simplified Charts Mockup */}
              <div className="bg-[#0e1424] p-4 rounded-xl border border-slate-800/60 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-300">Revenue Stream</span>
                  <span className="text-[10px] font-mono text-slate-500">Hourly intervals</span>
                </div>
                <div className="h-28 flex items-end justify-between gap-1.5 pt-4">
                  {[45, 60, 55, 75, 90, 80, 95, 110, 105, 120, 130, 125].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 rounded-sm transition-all hover:brightness-125" 
                        style={{ height: `${(val / 140) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom widget Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Channels Donut representation */}
                <div className="bg-[#0e1424] p-4 rounded-xl border border-slate-800/60 flex flex-col">
                  <span className="text-xs font-semibold text-slate-300 mb-2">Top Channels</span>
                  <div className="flex items-center gap-4 py-1">
                    {/* Ring placeholder */}
                    <div className="relative w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent border-r-transparent animate-spin-slow" />
                      <span className="text-[10px] font-bold text-white">Direct</span>
                    </div>
                    <div className="flex-1 text-[10px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"/> Direct</span>
                        <span className="font-semibold text-white">42%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Email</span>
                        <span className="font-semibold text-white">26%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"/> Social</span>
                        <span className="font-semibold text-white">18%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-[#0e1424] p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-300 mb-2 block">Recent Transactions</span>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-white font-medium">Acme Inc.</span>
                      <span className="font-mono text-slate-300">$1,250.00</span>
                      <span className="text-teal-400">Paid</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-white font-medium">Globex</span>
                      <span className="font-mono text-slate-300">$980.00</span>
                      <span className="text-teal-400">Paid</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-white font-medium">Intech</span>
                      <span className="font-mono text-slate-300">$675.00</span>
                      <span className="text-amber-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Enterprise Logos */}
        <div className="mt-28 border-t border-slate-800/60 pt-10 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">
            TRUSTED BY MODERN TEAMS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 text-slate-400 font-bold tracking-tight opacity-70">
            {["Acme", "Globex", "Intech", "Soylent", "Umbrella"].map((brand, i) => (
              <div key={i} className="flex items-center gap-2 hover:opacity-100 hover:text-white transition-all cursor-default">
                <div className="w-6 h-6 rounded bg-slate-800/80 flex items-center justify-center font-mono text-xs font-bold">{brand[0]}</div>
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Features Section (Bento Grid) */}
        <section id="features" className="mt-32 pt-16 border-t border-slate-800/60">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Grade Analytics Engine</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to ingest unstructured data, optimize query throughput, compose visual components, and deploy embedded insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Powered */}
            <div className="bg-[#0c101b] border border-slate-800/60 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group hover:bg-[#0e1424]">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Powered</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Intelligent insights, automated chart configurations, and AI-driven schema conversion to accelerate your analytics workflow.
              </p>
            </div>

            {/* Reusable Components */}
            <div className="bg-[#0c101b] border border-slate-800/60 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group hover:bg-[#0e1424]">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reusable Components</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Build once and reuse across multiple dashboards, widgets, and external client platforms without duplicating any code.
              </p>
            </div>

            {/* Multiple Data Sources */}
            <div className="bg-[#0c101b] border border-slate-800/60 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group hover:bg-[#0e1424]">
              <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multiple Data Sources</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect REST APIs, GraphQL, Cloud Databases, and upload unstructured files seamlessly into our ingestion engine.
              </p>
            </div>

            {/* Secure & Scalable */}
            <div className="bg-[#0c101b] border border-slate-800/60 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group hover:bg-[#0e1424]">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Scalable</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enterprise grade security with role based access control, custom SSO providers, detailed query audit logs, and data firewalls.
              </p>
            </div>

            {/* Developer Friendly */}
            <div className="bg-[#0c101b] border border-slate-800/60 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group hover:bg-[#0e1424]">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Developer Friendly</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Comprehensive JavaScript/TypeScript SDKs, robust REST APIs, and full documentation built by developers, for developers.
              </p>
            </div>

            {/* Embed Anywhere */}
            <div className="bg-[#0c101b] border border-slate-800/60 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group hover:bg-[#0e1424]">
              <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Embed Anywhere</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Securely embed dashboards and widgets into customer portals or third-party web apps with just a few lines of copyable HTML.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#04060a] px-6 py-12 relative z-10 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-mono text-[10px] font-bold text-white">0S</div>
            <span className="font-semibold text-white">AiDi Studio</span>
          </div>
          <div>
            © 2026 AiDi Studio. All rights reserved. Built for power-users, data architects, and modern developers.
          </div>
        </div>
      </footer>
    </div>
  );
}
