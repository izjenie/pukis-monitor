import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
  suffix?: string;
  min?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  testId,
  suffix,
  min = 0,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const numVal = val === "" ? 0 : parseInt(val);
    if (numVal >= min) {
      onChange(numVal);
    }
  };

  const formatValue = (val: number) => {
    return val === 0 ? "" : val.toString();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={testId} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
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
            "text-right font-mono min-h-12",
            suffix && "pr-16",
            disabled && "bg-muted cursor-not-allowed"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
