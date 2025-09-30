// Minimal PBKDF2 + AES-GCM helpers using Web Crypto

export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJson(obj: any, password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(obj));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const out = new Uint8Array(16 + 12 + (ciphertext as ArrayBuffer).byteLength);
  out.set(salt, 0);
  out.set(iv, 16);
  out.set(new Uint8Array(ciphertext as ArrayBuffer), 28);
  return btoa(String.fromCharCode(...out));
}

export async function decryptJson(b64: string, password: string): Promise<any> {
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const salt = bin.slice(0, 16);
  const iv = bin.slice(16, 28);
  const cipher = bin.slice(28);
  const key = await deriveKeyFromPassword(password, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plain));
}


