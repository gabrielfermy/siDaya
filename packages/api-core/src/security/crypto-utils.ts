import crypto from 'crypto';

export interface TokenClaims {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  email?: string | undefined;
  fullName?: string | undefined;
  iat?: number | undefined;
  exp?: number | undefined;
  iss?: string | undefined;
  aud?: string | undefined;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Constant-time string equality check to prevent timing side-channel attacks.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Hashes password using salted scrypt (CPU and memory-hard).
 * Output format: scrypt$<salt_hex>$<derived_key_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(32).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a plaintext password against a salted scrypt hash in constant time.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith('scrypt$')) {
    // If legacy plaintext or malformed, reject
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 3) {
    return false;
  }

  const salt = parts[1]!;
  const expectedKeyHex = parts[2]!;

  return new Promise((resolve) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        resolve(false);
        return;
      }
      const derivedKeyHex = derivedKey.toString('hex');
      resolve(timingSafeEqualStrings(derivedKeyHex, expectedKeyHex));
    });
  });
}

/**
 * Hashes a 4-6 digit numeric Station PIN with a random salt.
 */
export function hashPin(pin: string, customSalt?: string): string {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(pin, salt, 10000, 32, 'sha256');
  return `pin_pbkdf2$${salt}$${key.toString('hex')}`;
}

/**
 * Verifies numeric Station PIN in constant time.
 */
export function verifyPin(pin: string, storedPinHash: string): boolean {
  if (!storedPinHash) return false;
  if (!storedPinHash.startsWith('pin_pbkdf2$')) {
    // If legacy plaintext, fallback check for backward compatibility in mock seeds
    return timingSafeEqualStrings(pin, storedPinHash);
  }

  const parts = storedPinHash.split('$');
  if (parts.length !== 3) return false;

  const salt = parts[1]!;
  const expectedHex = parts[2]!;
  const derived = crypto.pbkdf2Sync(pin, salt, 10000, 32, 'sha256').toString('hex');

  return timingSafeEqualStrings(derived, expectedHex);
}

const JWT_DEFAULT_SECRET = process.env['JWT_SECRET'] || 'sidaya_master_jwt_secret_dev_key_change_in_prod_98765';
const JWT_ISSUER = 'sidaya-auth-service';
const JWT_AUDIENCE = 'sidaya-platform';

/**
 * Signs a cryptographic JWT token (HS256) with expiration.
 */
export function signJwtToken(
  payload: Omit<TokenClaims, 'iat' | 'exp' | 'iss' | 'aud'>,
  secret: string = JWT_DEFAULT_SECRET,
  expiresInSeconds: number = 12 * 3600, // 12 hours
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenClaims = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64url');

  return `${message}.${signature}`;
}

/**
 * Cryptographically verifies JWT token and extracts claims.
 * Throws an error if expired, invalid signature, or tampered.
 */
export function verifyJwtToken<T extends TokenClaims = TokenClaims>(
  token: string,
  secret: string = JWT_DEFAULT_SECRET,
): T {
  if (!token || typeof token !== 'string') {
    throw new Error('Authentication token is missing or empty.');
  }

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT token structure.');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const message = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64url');

  if (!timingSafeEqualStrings(signatureB64!, expectedSignature)) {
    throw new Error('Invalid JWT signature: Token has been tampered with or secret mismatch.');
  }

  let claims: T;
  try {
    claims = JSON.parse(Buffer.from(payloadB64!, 'base64url').toString('utf8')) as T;
  } catch {
    throw new Error('Invalid JWT payload: Failed to decode JSON claims.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now) {
    throw new Error('Authentication token has expired. Please log in again.');
  }

  return claims;
}

/**
 * Encrypts sensitive credentials (like merchant BYOK keys) using AES-256-GCM.
 */
export function encryptSecret(
  plaintext: string,
  masterKey: string = JWT_DEFAULT_SECRET,
): EncryptedPayload {
  const key = crypto.createHash('sha256').update(masterKey).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Decrypts AES-256-GCM encrypted payload.
 */
export function decryptSecret(
  encrypted: EncryptedPayload,
  masterKey: string = JWT_DEFAULT_SECRET,
): string {
  const key = crypto.createHash('sha256').update(masterKey).digest();
  const iv = Buffer.from(encrypted.iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));

  let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}
