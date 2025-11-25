/**
 * Encryption utilities for Klaviyo API keys
 * Uses AES-GCM encryption with the ENCRYPTION_KEY secret
 */

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a 32-character string');
}

/**
 * Convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to string
 */
function uint8ArrayToString(arr: Uint8Array): string {
  return new TextDecoder().decode(arr);
}

/**
 * Convert Uint8Array to base64
 */
function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = '';
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate encryption key from ENCRYPTION_KEY string
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyMaterial = stringToUint8Array(ENCRYPTION_KEY!);
  return await crypto.subtle.importKey(
    'raw',
    keyMaterial as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a Klaviyo API key
 * Returns base64-encoded: iv + encrypted data
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
    
    const plaintextData = stringToUint8Array(plaintext);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintextData as BufferSource
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return uint8ArrayToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt a Klaviyo API key
 * Expects base64-encoded: iv + encrypted data
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const combined = base64ToUint8Array(encrypted);
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    return uint8ArrayToString(new Uint8Array(decrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Check if a string is encrypted (base64 format)
 * Simple heuristic: encrypted keys are base64, plaintext keys start with "pk_"
 */
export function isEncrypted(value: string): boolean {
  // If it starts with pk_, it's plaintext
  if (value.startsWith('pk_')) {
    return false;
  }
  
  // Try to decode as base64 - if successful, likely encrypted
  try {
    const decoded = base64ToUint8Array(value);
    return decoded.length > 12; // Should have at least IV (12 bytes) + some data
  } catch {
    return false;
  }
}
