import { dnsProviders, type DNSProvider } from "@/lib/dns-providers";
import { cn } from "@/lib/utils";
import { Shield, Globe, Lock, Filter, Settings } from "lucide-react";

interface ProviderSelectorProps {
  selectedProvider: string;
  onSelect: (provider: DNSProvider) => void;
}

const providerIcons: Record<string, React.ReactNode> = {
  cloudflare: <Shield className="h-5 w-5" />,
  google: <Globe className="h-5 w-5" />,
  quad9: <Lock className="h-5 w-5" />,
  adguard: <Filter className="h-5 w-5" />,
  custom: <Settings className="h-5 w-5" />,
};

export function ProviderSelector({ selectedProvider, onSelect }: ProviderSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {dnsProviders.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onSelect(provider)}
          className={cn(
            "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:border-primary/50 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selectedProvider === provider.id
              ? "border-primary bg-accent shadow-subtle"
              : "border-border bg-card"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              selectedProvider === provider.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}
          >
            {providerIcons[provider.id]}
          </div>
          <span className="text-sm font-medium">{provider.name}</span>
        </button>
      ))}
    </div>
  );
}
