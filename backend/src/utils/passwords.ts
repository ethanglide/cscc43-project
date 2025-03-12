import argon2 from "argon2";

/**
 * Hash a password
 * @param password password to hash
 * @returns hashed password
 */
export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

/**
 * Verify a password
 * @param hash hashed password
 * @param password password to verify
 * @returns true is password is verified, false otherwise
 */
export async function verifyPassword(hash: string, password: string) {
  return await argon2.verify(hash, password);
}
