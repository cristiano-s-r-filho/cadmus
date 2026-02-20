/**
 * Cadmus Sovereign Crypto Bridge
 * Implements Client-Side Field Encryption (CSFE) using Web Crypto API.
 * Uses AES-256-GCM for authenticated encryption.
 */

export class SovereignCrypto {
    private static ALGO = 'AES-GCM';
    private static KDF_ALGO = 'PBKDF2';
    private static HASH = 'SHA-256';
    private static ITERATIONS = 100000;

    /**
     * Derives a cryptographic key from a user secret using PBKDF2.
     * @param secret The master password or vault key.
     * @param salt A unique salt (usually the user ID).
     */
    private static async deriveKey(secret: string, salt: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const secretData = encoder.encode(secret);
        const saltData = encoder.encode(salt);

        // 1. Import raw secret as a base key
        const baseKey = await crypto.subtle.importKey(
            'raw',
            secretData,
            { name: this.KDF_ALGO },
            false,
            ['deriveKey']
        );

        // 2. Derive the actual AES-GCM key
        return crypto.subtle.deriveKey(
            {
                name: this.KDF_ALGO,
                salt: saltData,
                iterations: this.ITERATIONS,
                hash: this.HASH
            },
            baseKey,
            { name: this.ALGO, length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypts a plain text string.
     * Returns a base64 encoded string containing IV + Ciphertext.
     */
    static async encrypt(plainText: string, secret: string, salt: string): Promise<string> {
        const key = await this.deriveKey(secret, salt);
        const iv = crypto.getRandomValues(new Uint8Array(12)); 
        const encoder = new TextEncoder();
        const data = encoder.encode(plainText);

        const encrypted = await crypto.subtle.encrypt(
            { name: this.ALGO, iv },
            key,
            data
        );

        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Decrypts a base64 encoded string (IV + Ciphertext).
     */
    static async decrypt(cipherTextBase64: string, secret: string, salt: string): Promise<string> {
        try {
            const key = await this.deriveKey(secret, salt);
            const combined = new Uint8Array(
                atob(cipherTextBase64).split('').map(c => c.charCodeAt(0))
            );

            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: this.ALGO, iv },
                key,
                data
            );

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error('[Sovereign Crypto] Decryption failed. Invalid key or corrupted data.', e);
            return ' [DECRYPTION_ERROR] ';
        }
    }

    /**
     * Heuristic to check if a value is encrypted.
     * AES-256-GCM IV (12) + Tag (16) = 28 bytes. Base64(28) = 40 chars.
     */
    static isEncrypted(value: any): boolean {
        if (typeof value !== 'string') return false;
        return value.length >= 40 && /^[A-Za-z0-9+/=]+$/.test(value);
    }
}