// Re-export from pkijs-based signer for signing functionality
export { signMobileConfig, downloadSignedProfile } from "./profile-signer-pkijs";
export type { SigningConfig } from "./profile-signer-pkijs";

import * as pkijs from "pkijs";
import { Convert } from "pvtsutils";

/**
 * Decode PEM to ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  
  return Convert.FromBase64(b64);
}

/**
 * Extracts the first certificate from PEM content (handles fullchain files)
 */
export function extractFirstCertificate(pem: string): string | null {
  const match = pem.match(
    /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/
  );
  return match ? match[0] : null;
}

export type PemValidationResult =
  | { valid: true }
  | {
      valid: false;
      code?: "NO_PEM_BLOCK" | "UNSUPPORTED_KEY_TYPE" | "ENCRYPTED_KEY" | "INVALID_PEM";
      error: string;
    };

/**
 * Validates a PEM certificate (supports fullchain - uses first cert)
 * Now supports both RSA and ECDSA certificates via pkijs
 */
export function validatePemCertificate(pem: string): PemValidationResult {
  try {
    const firstCert = extractFirstCertificate(pem);
    if (!firstCert) {
      return { valid: false, code: "NO_PEM_BLOCK", error: "No PEM certificate block found" };
    }

    const certBuffer = pemToArrayBuffer(firstCert);
    // This will throw if the certificate is invalid
    pkijs.Certificate.fromBER(certBuffer);
    return { valid: true };
  } catch (err) {
    console.warn("Certificate validation error:", err);
    return { valid: false, code: "INVALID_PEM", error: "Invalid PEM certificate" };
  }
}

/**
 * Validates a PEM private key (supports RSA and ECDSA; encrypted keys are not supported)
 */
export function validatePemPrivateKey(pem: string): PemValidationResult {
  const trimmed = pem.trim();

  // Common encrypted formats
  if (
    trimmed.includes("-----BEGIN ENCRYPTED PRIVATE KEY-----") ||
    trimmed.includes("Proc-Type: 4,ENCRYPTED")
  ) {
    return {
      valid: false,
      code: "ENCRYPTED_KEY",
      error: "Encrypted private keys are not supported. Please provide an unencrypted private key.",
    };
  }

  // Check for valid PEM header
  const hasValidHeader = 
    trimmed.includes("-----BEGIN PRIVATE KEY-----") ||
    trimmed.includes("-----BEGIN RSA PRIVATE KEY-----") ||
    trimmed.includes("-----BEGIN EC PRIVATE KEY-----");

  if (!hasValidHeader) {
    return { valid: false, code: "NO_PEM_BLOCK", error: "No valid private key PEM block found" };
  }

  try {
    // Try to decode the base64 content to verify it's valid
    const keyBuffer = pemToArrayBuffer(trimmed);
    if (keyBuffer.byteLength === 0) {
      return { valid: false, code: "INVALID_PEM", error: "Invalid PEM private key" };
    }
    return { valid: true };
  } catch {
    return { valid: false, code: "INVALID_PEM", error: "Invalid PEM private key" };
  }
}

/**
 * Extracts certificate info for display (handles fullchain - uses first cert)
 * Supports both RSA and ECDSA certificates
 */
export function getCertificateInfo(pem: string): {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
} | null {
  try {
    const firstCert = extractFirstCertificate(pem);
    if (!firstCert) return null;
    
    const certBuffer = pemToArrayBuffer(firstCert);
    const cert = pkijs.Certificate.fromBER(certBuffer);
    
    // Extract CN from subject
    let subject = "Unknown";
    for (const rdn of cert.subject.typesAndValues) {
      if (rdn.type === "2.5.4.3") { // CN OID
        subject = rdn.value.valueBlock.value;
        break;
      }
    }
    
    // Extract CN from issuer
    let issuer = "Unknown";
    for (const rdn of cert.issuer.typesAndValues) {
      if (rdn.type === "2.5.4.3") { // CN OID
        issuer = rdn.value.valueBlock.value;
        break;
      }
    }
    
    return {
      subject,
      issuer,
      validFrom: cert.notBefore.value,
      validTo: cert.notAfter.value,
    };
  } catch (err) {
    console.warn("Failed to parse certificate info:", err);
    return null;
  }
}

/**
 * Parses multiple certificates from a chain file
 */
export function parseCertificateChain(pem: string): string[] {
  const certs: string[] = [];
  const regex = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;
  let match;

  while ((match = regex.exec(pem)) !== null) {
    certs.push(match[0]);
  }

  return certs;
}
