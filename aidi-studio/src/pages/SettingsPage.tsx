import * as React from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKUP_CODES = [
  "4F2A-9K1D",
  "7Q3E-2M8L",
  "1X6P-5R0T",
  "8C4N-3W7B",
  "2H9J-6Y1V",
  "5G0S-4Z8K",
  "9D3F-1L6Q",
  "6B7M-2X5N",
];

interface SessionRow {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const INITIAL_SESSIONS: SessionRow[] = [
  { id: "s1", device: "Chrome on macOS", location: "San Francisco, US", lastActive: "active now", current: true },
  { id: "s2", device: "Safari on iPhone", location: "San Francisco, US", lastActive: "2h ago", current: false },
  { id: "s3", device: "Firefox on Windows", location: "Austin, US", lastActive: "3d ago", current: false },
];

export default function SettingsPage() {
  const { session, toast, logoutAllDevices } = useApp();

  const [name, setName] = React.useState(session?.user.display_name ?? "");
  const [totpEnabled, setTotpEnabled] = React.useState(false);
  const [show2faSetup, setShow2faSetup] = React.useState(false);
  const [showBackupCodes, setShowBackupCodes] = React.useState(false);
  const [totpCode, setTotpCode] = React.useState("");
  const [sessions, setSessions] = React.useState<SessionRow[]>(INITIAL_SESSIONS);

  const onToggle2fa = () => {
    if (totpEnabled) {
      setTotpEnabled(false);
      setShowBackupCodes(false);
      setShow2faSetup(false);
      toast("2FA disabled", "info");
      return;
    }
    setShow2faSetup(true);
    setShowBackupCodes(false);
  };

  const onConfirm2fa = () => {
    if (totpCode.length < 6) {
      toast("Enter the 6-digit code", "error");
      return;
    }
    setTotpEnabled(true);
    setShow2faSetup(false);
    setShowBackupCodes(true);
    toast("2FA enabled", "success");
  };

  const onRevoke = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast("Session revoked", "success");
  };

  return (
    <div className="max-w-[640px] px-11 py-9">
      <div className="font-display mb-[26px] text-[24px] font-bold text-ink-1">Account settings</div>

      <Card className="mb-[18px]">
        <div className="mb-4 text-[14px] font-semibold text-ink-1">Profile</div>
        <div className="mb-1 flex gap-3.5">
          <div className="flex-1">
            <Label htmlFor="settings-name">Display name</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" value={session?.user.email ?? ""} disabled className="bg-surface-sunken text-ink-3" />
          </div>
        </div>
        <Button size="sm" onClick={() => toast("Profile updated", "success")} className="mt-3.5">
          Save changes
        </Button>
      </Card>

      <Card className="mb-[18px]">
        <div className="mb-4 text-[14px] font-semibold text-ink-1">Change password</div>
        <div className="flex max-w-[320px] flex-col gap-3">
          <Input type="password" placeholder="Current password" className="mt-0" />
          <Input type="password" placeholder="New password" className="mt-0" />
        </div>
        <Button variant="outline" size="sm" onClick={() => toast("Password updated", "success")} className="mt-3.5">
          Update password
        </Button>
      </Card>

      <Card className="mb-[18px]">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-ink-1">Two-factor authentication</div>
            <div className="mt-1 text-[12px] text-ink-3">
              {totpEnabled ? "Enabled — backup codes issued" : "Not enabled — add an extra layer of security"}
            </div>
          </div>
          <Button
            size="sm"
            onClick={onToggle2fa}
            style={totpEnabled ? { background: "#2a1518", color: "var(--color-brand-red)" } : undefined}
          >
            {totpEnabled ? "Disable" : "Enable"}
          </Button>
        </div>

        {show2faSetup && (
          <div className="mt-4 flex items-center gap-4 border-t border-border-subtle pt-4">
            <div
              className="h-[100px] w-[100px] shrink-0 rounded-md"
              style={{
                background:
                  "repeating-conic-gradient(#f5f5f7 0% 25%, #0b0b10 0% 50%) 0 0/20px 20px",
              }}
            />
            <div className="flex-1">
              <div className="mb-2 text-[12px] text-ink-2">
                Scan with your authenticator app, then enter the 6-digit code.
              </div>
              <div className="flex gap-2">
                <Input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="mt-0 w-[110px] font-mono"
                />
                <Button size="sm" onClick={onConfirm2fa}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {showBackupCodes && (
          <div className="mt-4 border-t border-border-subtle pt-4">
            <div className="mb-2.5 text-[12px] text-ink-2">Backup codes — store these somewhere safe:</div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[12px] text-brand-cyan">
              {BACKUP_CODES.map((c) => (
                <div key={c} className="rounded-md bg-surface-sunken px-2.5 py-1.5">
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[14px] font-semibold text-ink-1">Active sessions</div>
          <div onClick={logoutAllDevices} className="cursor-pointer text-[12px] text-brand-red">
            Log out of all devices
          </div>
        </div>
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between border-b border-border-subtle py-2.5 last:border-b-0"
          >
            <div>
              <div className="text-[13px] font-medium text-ink-1">
                {s.device}
                {s.current && <span className="ml-1 text-[10px] font-bold text-brand-green"> · THIS DEVICE</span>}
              </div>
              <div className="text-[11px] text-ink-3">
                {s.location} · {s.lastActive}
              </div>
            </div>
            {!s.current && (
              <div onClick={() => onRevoke(s.id)} className="cursor-pointer text-[12px] text-brand-red">
                Revoke
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
