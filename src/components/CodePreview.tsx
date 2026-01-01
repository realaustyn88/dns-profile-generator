import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CodePreviewProps {
  code: string;
  filename: string;
  onDownload: () => void;
}

export function CodePreview({ code, filename, onDownload }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-border bg-code">
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
        <span className="font-mono text-sm text-muted-foreground">{filename}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onDownload}
            className="h-8 gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
      <div className="max-h-[400px] overflow-auto p-4">
        <pre className="font-mono text-xs leading-relaxed text-code-foreground">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
