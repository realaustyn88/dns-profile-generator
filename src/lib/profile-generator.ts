export interface ProfileConfig {
  profileName: string;
  organizationName: string;
  profileIdentifier: string;
  dnsProtocol: "HTTPS" | "TLS";
  serverUrl: string;
  serverIps: string[];
  encryptedOnly: boolean;
  payloadScope: "System" | "User";
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateMobileConfig(config: ProfileConfig): string {
  const profileUUID = generateUUID();
  const payloadUUID = generateUUID();

  const serverAddressesXml =
    config.serverIps.length > 0
      ? `
      <key>ServerAddresses</key>
      <array>
        ${config.serverIps.map((ip) => `<string>${escapeXml(ip.trim())}</string>`).join("\n        ")}
      </array>`
      : "";

  const dnsSettingsPayload =
    config.dnsProtocol === "HTTPS"
      ? `
      <key>DNSProtocol</key>
      <string>HTTPS</string>
      <key>ServerURL</key>
      <string>${escapeXml(config.serverUrl)}</string>${serverAddressesXml}`
      : `
      <key>DNSProtocol</key>
      <string>TLS</string>
      <key>ServerName</key>
      <string>${escapeXml(config.serverUrl)}</string>${serverAddressesXml}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>DNSSettings</key>
        <dict>${dnsSettingsPayload}
        </dict>
        <key>OnDemandRules</key>
        <array>
          <dict>
            <key>Action</key>
            <string>Connect</string>
          </dict>
        </array>
        <key>PayloadDisplayName</key>
        <string>DNS Settings</string>
        <key>PayloadIdentifier</key>
        <string>${escapeXml(config.profileIdentifier)}.dns</string>
        <key>PayloadType</key>
        <string>com.apple.dnsSettings.managed</string>
        <key>PayloadUUID</key>
        <string>${payloadUUID}</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>ProhibitDisablement</key>
        <${config.encryptedOnly}/>
      </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Configures encrypted DNS (${config.dnsProtocol === "HTTPS" ? "DNS over HTTPS" : "DNS over TLS"}) for secure DNS resolution.</string>
    <key>PayloadDisplayName</key>
    <string>${escapeXml(config.profileName)}</string>
    <key>PayloadIdentifier</key>
    <string>${escapeXml(config.profileIdentifier)}</string>${
      config.organizationName
        ? `
    <key>PayloadOrganization</key>
    <string>${escapeXml(config.organizationName)}</string>`
        : ""
    }
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadScope</key>
    <string>${config.payloadScope}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${profileUUID}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
  </dict>
</plist>`;

  return xml;
}

export function downloadProfile(xml: string, filename: string): void {
  const blob = new Blob([xml], { type: "application/x-apple-aspen-config" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".mobileconfig") ? filename : `${filename}.mobileconfig`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
