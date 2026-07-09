import React, { useState } from "react";
import { Settings, Shield, Key, Eye, HelpCircle, Check, Database, Sparkles } from "lucide-react";

export default function SettingsView() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("aidi_live_72k39x9b4s84s9n3m29a8a7s9d8f9g");
  const [saved, setSaved] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("Corporate Data Workspace");
  const [domainWhitelist, setDomainWhitelist] = useState("*.company.com, *.app.aidistudio.com");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-[#3b82f6]" />
          Workspace Configuration Settings
        </h2>
        <p className="text-sm text-[#71717a] mt-1">
          Configure security credentials, authorized domains, webhook endpoints, and API client secret credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config Forms */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-[#09090b] border border-[#27272a] rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3b82f6]" />
              General Workspace Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Workspace Display Name
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Billing Class
                </label>
                <div className="w-full bg-[#18181b]/40 border border-[#27272a] rounded-lg py-2.5 px-3 text-xs text-[#71717a] select-none">
                  Enterprise (Premium Tier)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                Authorized Domains (Separated by commas)
              </label>
              <input
                type="text"
                required
                value={domainWhitelist}
                onChange={(e) => setDomainWhitelist(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
              />
              <span className="text-[10px] text-[#71717a] mt-1 block font-medium">
                Used to secure widgets embedded on external websites via iFrames. Wildcards supported.
              </span>
            </div>

            <button
              type="submit"
              className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Settings Saved!
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </form>

          {/* API Keys Configuration Box */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#3b82f6]" />
              API Credentials & Secrets
            </h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Use these keys to authenticate requests with our REST APIs or initialize the developer client SDK libraries.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Live Production Secret Token
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? "text" : "password"}
                    readOnly
                    value={apiKey}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 pl-3 pr-10 text-xs font-mono text-[#3b82f6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Status Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3b82f6]" />
              Platform Credentials
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#27272a] pb-2">
                <span className="text-[#71717a]">Gemini AI Model</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#3b82f6] animate-pulse" />
                  gemini-3.5-flash
                </span>
              </div>
              <div className="flex justify-between border-b border-[#27272a] pb-2">
                <span className="text-[#71717a]">Vite Build Port</span>
                <span className="text-white font-mono font-semibold">3000 (Proxy Enforced)</span>
              </div>
              <div className="flex justify-between border-b border-[#27272a] pb-2">
                <span className="text-[#71717a]">Encryption Layer</span>
                <span className="text-emerald-400 font-semibold">AES-256 Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Operational SLA</span>
                <span className="text-emerald-400 font-bold font-mono">99.98% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
