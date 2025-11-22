import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
  icon?: React.ReactNode;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  testId,
  icon,
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    onChange(val === "" ? 0 : parseInt(val));
  };

  const formatValue = (val: number) => {
    return val === 0 ? "" : val.toLocaleString("id-ID");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon && <div className="h-5 w-5 flex-shrink-0">{icon}</div>}
        <Label htmlFor={testId} className="text-sm font-medium">
          {label}
        </Label>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
          Rp
        </span>
        <Input
          id={testId}
          data-testid={testId}
          type="text"
          inputMode="numeric"
          value={formatValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 text-right font-mono min-h-12",
            disabled && "bg-muted cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
}
