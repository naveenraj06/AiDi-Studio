import * as React from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { session, toast, logoutAllDevices } = useApp();

  const [name, setName] = React.useState(session?.user.display_name ?? "");
  const [savingProfile, setSavingProfile] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [savingPassword, setSavingPassword] = React.useState(false);

  const [enabledFactorId, setEnabledFactorId] = React.useState<string | null>(null);
  const [checkingMfa, setCheckingMfa] = React.useState(true);
  const [enrolling, setEnrolling] = React.useState(false);
  const [pendingFactorId, setPendingFactorId] = React.useState<string | null>(null);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [totpCode, setTotpCode] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find((f) => f.status === "verified");
      setEnabledFactorId(verified?.id ?? null);
      setCheckingMfa(false);
    });
  }, []);

  const totpEnabled = !!enabledFactorId;

  const onSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { name } });
    setSavingProfile(false);
    if (error) return toast(error.message, "error");
    toast("Profile updated", "success");
  };

  const onUpdatePassword = async () => {
    if (!session) return;
    if (newPassword.length < 8) return toast("New password must be at least 8 characters", "error");
    setSavingPassword(true);
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });
    if (verifyError) {
      setSavingPassword(false);
      return toast("Current password is incorrect", "error");
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast(error.message, "error");
    setCurrentPassword("");
    setNewPassword("");
    toast("Password updated", "success");
  };

  const onToggle2fa = async () => {
    if (totpEnabled && enabledFactorId) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: enabledFactorId });
      if (error) return toast(error.message, "error");
      setEnabledFactorId(null);
      toast("2FA disabled", "info");
      return;
    }
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setEnrolling(false);
    if (error) return toast(error.message, "error");
    setPendingFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const onConfirm2fa = async () => {
    if (!pendingFactorId) return;
    if (totpCode.length < 6) return toast("Enter the 6-digit code", "error");
    setConfirming(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactorId,
    });
    if (challengeError || !challenge) {
      setConfirming(false);
      return toast(challengeError?.message ?? "Couldn't start verification", "error");
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.id,
      code: totpCode,
    });
    setConfirming(false);
    if (error) return toast(error.message, "error");
    setEnabledFactorId(pendingFactorId);
    setPendingFactorId(null);
    setQrCode(null);
    setSecret(null);
    setTotpCode("");
    toast("2FA enabled", "success");
  };

  const onCancel2fa = () => {
    setPendingFactorId(null);
    setQrCode(null);
    setSecret(null);
    setTotpCode("");
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
        <Button size="sm" onClick={onSaveProfile} disabled={savingProfile} className="mt-3.5">
          {savingProfile ? "Saving…" : "Save changes"}
        </Button>
      </Card>

      <Card className="mb-[18px]">
        <div className="mb-4 text-[14px] font-semibold text-ink-1">Change password</div>
        <div className="flex max-w-[320px] flex-col gap-3">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-0"
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-0"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onUpdatePassword} disabled={savingPassword} className="mt-3.5">
          {savingPassword ? "Updating…" : "Update password"}
        </Button>
      </Card>

      <Card className="mb-[18px]">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-ink-1">Two-factor authentication</div>
            <div className="mt-1 text-[12px] text-ink-3">
              {checkingMfa
                ? "Checking status…"
                : totpEnabled
                  ? "Enabled for your account"
                  : "Not enabled — add an extra layer of security"}
            </div>
          </div>
          <Button
            size="sm"
            onClick={onToggle2fa}
            disabled={checkingMfa || enrolling}
            style={totpEnabled ? { background: "#2a1518", color: "var(--color-brand-red)" } : undefined}
          >
            {enrolling ? "Starting…" : totpEnabled ? "Disable" : "Enable"}
          </Button>
        </div>

        {qrCode && (
          <div className="mt-4 flex items-center gap-4 border-t border-border-subtle pt-4">
            <img src={qrCode} alt="Scan with your authenticator app" className="h-[100px] w-[100px] shrink-0 rounded-md bg-white p-1" />
            <div className="flex-1">
              <div className="mb-1 text-[12px] text-ink-2">
                Scan with your authenticator app, then enter the 6-digit code.
              </div>
              {secret && (
                <div className="mb-2 break-all font-mono text-[11px] text-ink-3">Or enter manually: {secret}</div>
              )}
              <div className="flex gap-2">
                <Input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="mt-0 w-[110px] font-mono"
                />
                <Button size="sm" onClick={onConfirm2fa} disabled={confirming}>
                  {confirming ? "Confirming…" : "Confirm"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancel2fa}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[14px] font-semibold text-ink-1">Sessions</div>
          <div onClick={logoutAllDevices} className="cursor-pointer text-[12px] text-brand-red">
            Log out of all other devices
          </div>
        </div>
        <div className="text-[12px] text-ink-3">You're currently signed in as {session?.user.email}.</div>
      </Card>
    </div>
  );
}
