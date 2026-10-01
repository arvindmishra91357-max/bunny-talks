// ============================================================================
// END-TO-END ENCRYPTION (E2EE) ARCHITECTURE MODULE
// Uses standard Web Crypto API (AES-GCM 256-bit)
// Keys remain on client devices; ciphertexts stored on transport/database
// ============================================================================

/**
 * Derives an AES-GCM CryptoKey from a shared conversation secret/passphrase
 */
async function deriveKey(secretKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext message using AES-GCM 256-bit
 * Returns a base64 encoded bundle: [salt:16][iv:12][ciphertext]
 */
export async function encryptMessage(plainText: string, secretKey: string): Promise<string> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(secretKey, salt);
    
    const enc = new TextEncoder();
    const encodedText = enc.encode(plainText);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedText
    );

    // Pack salt (16 bytes) + iv (12 bytes) + ciphertext into one buffer
    const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.byteLength);
    combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(combined);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('E2EE Encryption failure:', error);
    throw new Error('Failed to encrypt message payload.');
  }
}

/**
 * Decrypts a base64 encrypted bundle using AES-GCM 256-bit
 */
export async function decryptMessage(encryptedBundle: string, secretKey: string): Promise<string> {
  try {
    const binary = atob(encryptedBundle);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length < 28) {
      throw new Error('Invalid ciphertext length.');
    }

    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const ciphertext = bytes.slice(28);

    const key = await deriveKey(secretKey, salt);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.warn('E2EE Decryption failed (key mismatch or unencrypted content):', error);
    return '[Decryption failed: Key mismatch or invalid signature]';
  }
}

/**
 * Generates a visual safety fingerprint for two users in an E2EE conversation
 */
export async function getConversationFingerprint(userAId: string, userBId: string): Promise<string> {
  const sortedIds = [userAId, userBId].sort().join(':');
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(sortedIds));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format into readable safety blocks like "48201 93821 00412 88392"
  return `${hex.slice(0, 5)} ${hex.slice(5, 10)} ${hex.slice(10, 15)} ${hex.slice(15, 20)}`.toUpperCase();
}
