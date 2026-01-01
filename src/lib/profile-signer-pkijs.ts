import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { Convert } from "pvtsutils";

export interface SigningConfig {
  signingCert: string; // PEM certificate
  privateKey: string; // PEM private key
  chainCerts: string[]; // Array of PEM certificates for the chain
}

/**
 * Decode PEM to ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Remove PEM header/footer and whitespace
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  
  return Convert.FromBase64(b64);
}

/**
 * Extract the first certificate from a PEM string (handles fullchain)
 */
function extractFirstCertPem(pem: string): string | null {
  const match = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
  return match ? match[0] : null;
}

/**
 * Detect key algorithm from private key PEM
 */
async function importPrivateKey(pem: string, cert: pkijs.Certificate): Promise<CryptoKey> {
  const keyBuffer = pemToArrayBuffer(pem);
  
  // Get algorithm info from certificate's public key
  const certAlgo = cert.subjectPublicKeyInfo.algorithm.algorithmId;
  
  // ECDSA OIDs
  const ecdsaOid = "1.2.840.10045.2.1"; // id-ecPublicKey
  // RSA OIDs
  const rsaOids = [
    "1.2.840.113549.1.1.1", // rsaEncryption
    "1.2.840.113549.1.1.11", // sha256WithRSAEncryption
  ];
  
  let algorithm: AlgorithmIdentifier | EcKeyImportParams | RsaHashedImportParams;
  let keyUsages: KeyUsage[];
  
  if (certAlgo === ecdsaOid) {
    // Get curve from certificate
    const curveOid = cert.subjectPublicKeyInfo.algorithm.algorithmParams?.valueBlock?.toString();
    let namedCurve = "P-256"; // Default
    
    // Map OID to curve name
    if (curveOid === "1.2.840.10045.3.1.7" || curveOid?.includes("1.2.840.10045.3.1.7")) {
      namedCurve = "P-256";
    } else if (curveOid === "1.3.132.0.34" || curveOid?.includes("1.3.132.0.34")) {
      namedCurve = "P-384";
    } else if (curveOid === "1.3.132.0.35" || curveOid?.includes("1.3.132.0.35")) {
      namedCurve = "P-521";
    }
    
    algorithm = { name: "ECDSA", namedCurve };
    keyUsages = ["sign"];
  } else if (rsaOids.includes(certAlgo)) {
    algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
    keyUsages = ["sign"];
  } else {
    // Try ECDSA first (more common for modern certs), then RSA
    try {
      algorithm = { name: "ECDSA", namedCurve: "P-384" };
      keyUsages = ["sign"];
      return await crypto.subtle.importKey("pkcs8", keyBuffer, algorithm, true, keyUsages);
    } catch {
      algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
      keyUsages = ["sign"];
    }
  }
  
  return await crypto.subtle.importKey("pkcs8", keyBuffer, algorithm, true, keyUsages);
}

/**
 * Signs a mobileconfig XML using S/MIME (PKCS#7/CMS)
 * Supports both RSA and ECDSA certificates via WebCrypto
 */
export async function signMobileConfig(
  xmlContent: string,
  config: SigningConfig
): Promise<Uint8Array> {
  try {
    // Extract first certificate from potentially fullchain PEM
    const firstCertPem = extractFirstCertPem(config.signingCert);
    if (!firstCertPem) {
      throw new Error("No valid certificate found in signing certificate");
    }
    
    // Parse the signing certificate
    const certBuffer = pemToArrayBuffer(firstCertPem);
    const signerCert = pkijs.Certificate.fromBER(certBuffer);
    
    // Import the private key using WebCrypto
    const privateKey = await importPrivateKey(config.privateKey, signerCert);
    
    // Determine hash algorithm based on key type
    const hashAlgorithm = "SHA-256";
    
    // Convert XML content to ArrayBuffer
    const contentBuffer = new TextEncoder().encode(xmlContent);
    
    // Create CMS SignedData structure
    const cmsSignedData = new pkijs.SignedData({
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: "1.2.840.113549.1.7.1", // id-data
        eContent: new asn1js.OctetString({ valueHex: contentBuffer.buffer }),
      }),
      signerInfos: [
        new pkijs.SignerInfo({
          sid: new pkijs.IssuerAndSerialNumber({
            issuer: signerCert.issuer,
            serialNumber: signerCert.serialNumber,
          }),
        }),
      ],
      certificates: [signerCert],
    });
    
    // Add chain certificates
    for (const chainCertPem of config.chainCerts) {
      try {
        const chainCertBuffer = pemToArrayBuffer(chainCertPem);
        const chainCert = pkijs.Certificate.fromBER(chainCertBuffer);
        cmsSignedData.certificates!.push(chainCert);
      } catch (e) {
        console.warn("Failed to parse chain certificate:", e);
      }
    }
    
    // Sign the data
    await cmsSignedData.sign(privateKey, 0, hashAlgorithm, contentBuffer.buffer);
    
    // Wrap in ContentInfo
    const contentInfo = new pkijs.ContentInfo({
      contentType: "1.2.840.113549.1.7.2", // id-signedData
      content: cmsSignedData.toSchema(true),
    });
    
    // Encode to DER
    const derBuffer = contentInfo.toSchema().toBER(false);
    
    return new Uint8Array(derBuffer);
  } catch (error) {
    console.error("Signing error:", error);
    throw new Error(
      `Failed to sign profile: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Downloads a signed profile
 */
export function downloadSignedProfile(
  signedData: Uint8Array,
  filename: string
): void {
  const blob = new Blob([new Uint8Array(signedData)], {
    type: "application/x-apple-aspen-config",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".mobileconfig")
    ? filename
    : `${filename}.mobileconfig`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
