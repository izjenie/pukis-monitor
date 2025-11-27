import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface WhatsAppSummaryProps {
  outletName: string;
  date: Date;
  totalRevenue: number;
  totalSold: number;
  cogsSold: number;
  grossMargin: number;
  grossMarginPercentage: number;
  mtdGrossMargin: number;
  mtdTotalSold: number;
  soldOutTime?: string;
  periodStart: string;
  periodEnd: string;
}

export function WhatsAppSummary({
  outletName,
  date,
  totalRevenue,
  totalSold,
  cogsSold,
  grossMargin,
  grossMarginPercentage,
  mtdGrossMargin,
  mtdTotalSold,
  soldOutTime,
  periodStart,
  periodEnd,
}: WhatsAppSummaryProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateSummary = () => {
    const dateStr = format(date, "d MMMM yyyy", { locale: localeId });
    
    return `SUMMARY PENJUALAN – ${outletName} – ${dateStr}

Pendapatan Total: ${formatCurrency(totalRevenue)}
Total Pukis Terjual: ${totalSold} pcs
COGS Terpakai: ${formatCurrency(cogsSold)}
Gross Margin: ${formatCurrency(grossMargin)} (${grossMarginPercentage.toFixed(1)}%)

MTD GM (${periodStart}–${periodEnd}): ${formatCurrency(mtdGrossMargin)}
MTD Total Pukis Terjual (${periodStart}–${periodEnd}): ${mtdTotalSold} pcs
${soldOutTime ? `\nJam Sold Out: ${soldOutTime}` : ""}`;
  };

  const handleCopy = async () => {
    const summary = generateSummary();
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        title: "Berhasil disalin!",
        description: "Summary telah disalin ke clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Gagal menyalin",
        description: "Silakan coba lagi",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20" data-testid="card-whatsapp-summary">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Summary WhatsApp
        </CardTitle>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-copy-summary"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Disalin
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Salin
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <pre
          className="bg-background/60 rounded-md p-4 text-xs md:text-sm font-mono whitespace-pre-wrap border border-primary/10"
          data-testid="text-summary-preview"
        >
          {generateSummary()}
        </pre>
      </CardContent>
    </Card>
  );
}
