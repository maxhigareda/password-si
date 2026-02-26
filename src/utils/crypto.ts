import CryptoJS from 'crypto-js';

// Get the encryption key from environment variables.
// Fallback is strictly for development/safety, but VITE_ENCRYPTION_KEY MUST
// be set in production in Vercel/Netlify.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default_local_secret_key_123!';

/**
 * Encrypts a plaintext string into an AES ciphertext string.
 */
export const encryptPassword = (plaintext: string): string => {
    if (!plaintext) return '';
    return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
};

/**
 * Decrypts an AES ciphertext string back to plaintext.
 * If decryption fails (e.g. because the string wasn't encrypted to begin with,
 * or it's a legacy plain-text password), it safely returns the original string.
 */
export const decryptPassword = (ciphertext: string): string => {
    if (!ciphertext) return '';

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // If it successfully decrypted but the output is empty, it might not be valid AES
        if (!originalText) {
            return ciphertext;
        }

        return originalText;
    } catch (error) {
        // If malformed UTF-8 or not actually encrypted, fallback to returning the raw string.
        // This is crucial for migrating old unencrypted databases smoothly.
        return ciphertext;
    }
};
