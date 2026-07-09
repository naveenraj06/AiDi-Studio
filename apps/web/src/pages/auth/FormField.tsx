import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rightSlot?: React.ReactNode;
  fontMono?: boolean;
}

export function FormField({ label, type = "text", value, onChange, placeholder, error, rightSlot, fontMono }: FormFieldProps) {
  return (
    <div className="mb-3 flex flex-col gap-1">
      <div className="flex justify-between">
        <Label>{label}</Label>
        {rightSlot}
      </div>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fontMono ? "font-mono" : undefined}
        style={{ marginTop: 0, borderColor: error ? "var(--color-brand-red)" : undefined }}
      />
      {error && <div className="text-[11px] text-brand-red">{error}</div>}
    </div>
  );
}
