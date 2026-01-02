import { dnsProviders, type DNSProvider } from "@/lib/dns-providers";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

interface ProviderSelectorProps {
  selectedProvider: string;
  onSelect: (provider: DNSProvider) => void;
}

// Brand icons as inline SVGs
const CloudflareIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.502-1.0615-.502H6.5195c-.0605 0-.1123-.0449-.127-.1035-.0146-.0596.0044-.1231.0508-.1661.0996-.0947.2207-.1543.3603-.1777.0088-.0008.0801-.0088.0977-.0088h9.1406c1.748 0 3.2129-1.2715 3.4746-2.9785.0156-.1025.0283-.2051.0361-.3086.0068-.0752-.0498-.1406-.1245-.1396-.3408.0039-.668.0625-.9794.1719-1.7578.6152-2.9853 2.2852-3.086 4.2188-.0273-.0186-.0576-.0352-.0908-.0489-.1299-.0576-.2754-.0888-.4287-.0888H7.0664c-.6455 0-1.1699.5235-1.1699 1.1699 0 .1367.0235.2676.0664.3887.1309.3633.3897.6523.7178.8174.1719.0879.3623.1396.5645.1396h9.6894c.1524 0 .2852-.1007.3232-.2461z"/>
    <path d="M18.1768 10.3643c-.0371-.0117-.0762-.0166-.1143-.0117-.0391.0039-.0772.0176-.1094.041-.0674.0469-.1113.1201-.1211.2012-.0371.3633-.1113.7178-.2246 1.0576-.4766 1.418-1.7793 2.4434-3.2676 2.4434H9.2803c-.3809 0-.7168.2871-.7588.6631L8.209 17.4844c-.0127.1113.0205.2236.0938.3105.0723.086.1758.1357.2861.1357h2.2471c.3223 0 .5996-.2344.6494-.5527l.2715-1.7383c.043-.376.377-.6631.7588-.6631h1.3418c2.8545 0 5.1445-2.2178 5.3174-5.0635.0078-.1191-.0654-.2285-.1768-.2686-.1016-.0371-.2061-.0693-.3115-.0996-.0576-.0156-.1162-.0313-.1748-.0469-.0391-.0098-.0772-.0205-.1162-.0303-.1162-.0283-.2334-.0527-.3506-.0732-.0352-.0068-.0684-.0127-.1025-.0186-.0645-.0127-.1299-.0225-.1953-.0313-.0176-.0029-.0361-.0049-.0537-.0068-.0986-.0127-.1963-.0225-.2959-.0283-.0205-.0019-.041-.0029-.0605-.0039-.0928-.0059-.1865-.0098-.2803-.0107-.0186 0-.0381 0-.0576-.0009-.082 0-.165 0-.2471.002-.0449 0-.0898.0019-.1348.0039-.0527.002-.1055.0059-.1582.0098-.0625.0039-.124.0078-.1856.0137-.0303.0029-.0606.0059-.0909.0088l-.0625.0078c-.0742.0088-.1475.0186-.2207.0303z"/>
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Quad9Icon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12.5 7C10.57 7 9 8.57 9 10.5c0 1.93 1.57 3.5 3.5 3.5.45 0 .88-.09 1.28-.24L13 17h2l1-4.04c.47-.81.75-1.74.75-2.71C15.75 8.35 14.4 7 12.5 7zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const AdGuardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.83-3.23 9.36-7 10.56-3.77-1.2-7-5.73-7-10.56v-5.7l7-3.12z"/>
    <path d="M10.29 9.71L8.88 11.12l2.12 2.12-2.12 2.12 1.41 1.41L12.41 14.65l2.12 2.12 1.41-1.41-2.12-2.12 2.12-2.12-1.41-1.41-2.12 2.12-2.12-2.12z"/>
  </svg>
);

const providerIcons: Record<string, React.ReactNode> = {
  cloudflare: <CloudflareIcon className="h-5 w-5" />,
  google: <GoogleIcon className="h-5 w-5" />,
  quad9: <Quad9Icon className="h-5 w-5" />,
  adguard: <AdGuardIcon className="h-5 w-5" />,
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
