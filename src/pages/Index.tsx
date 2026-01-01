import { ProfileForm } from "@/components/ProfileForm";
import { Shield, Smartphone, Monitor } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">DNS Profile Generator</span>
          </div>
          <a
            href="https://developer.apple.com/documentation/devicemanagement/dnssettings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Apple Docs →
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Hero Section */}
          <div className="mb-10 animate-slide-in text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Apple Encrypted DNS
              <br />
              <span className="text-primary">Profile Generator</span>
            </h1>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Create configuration profiles for DNS over HTTPS (DoH) or DNS over TLS (DoT) 
              to enable encrypted DNS system-wide on your Apple devices.
            </p>
          </div>

          {/* Form Card */}
          <div className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <ProfileForm />
          </div>

          {/* Compatibility Note */}
          <div className="mt-8 animate-fade-in rounded-xl bg-secondary/50 p-6">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Smartphone className="h-4 w-4" />
              <Monitor className="h-4 w-4" />
              Compatibility
            </h3>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">iOS / iPadOS:</span>{" "}
                14.0 and later
              </p>
              <p>
                <span className="font-medium text-foreground">macOS:</span>{" "}
                11.0 (Big Sur) and later
              </p>
              <p className="mt-2 text-xs">
                Configuration profiles can be installed by opening the .mobileconfig file on your device. 
                On iOS, go to Settings → General → VPN & Device Management to complete installation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            No data is collected or stored. All profile generation happens locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
