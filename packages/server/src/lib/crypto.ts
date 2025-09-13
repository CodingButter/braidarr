import * as argon2 from 'argon2';

/**
 * Hash a password using Argon2id
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify a password against an Argon2id hash
 * @param hash - The stored hash
 * @param password - The plain text password to verify
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if a hash needs rehashing (for security updates)
 * @param hash - The stored hash
 * @returns True if the hash needs to be updated
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}