"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportJobseekersCSV, type JobseekerFilters } from "../actions";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  filters: Omit<JobseekerFilters, "page" | "pageSize">;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportJobseekersCSV(filters);

      if (result.error || !result.csv || !result.filename) {
        throw new Error(result.error || "Export failed");
      }

      // Download CSV
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Export Complete",
        description: `Downloaded ${result.filename}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: error instanceof Error ? error.message : "Failed to export",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      <Download className="size-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
