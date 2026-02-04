export declare function setEncodeName(val: boolean): void;
/**
 * Base64 URL encodes a string.
 * @param {string} str - The string to encode.
 * @returns {string} The encoded string.
 */
export declare function base64UrlEncode(str: string): string;
/**
 * Base64 URL decodes a string.
 * @param {string} str - The string to decode.
 * @returns {string} The decoded string.
 */
export declare function base64UrlDecode(str: string): string;
/**
 * Generates a unique file path for uploads.
 * Structure: base64(userId)/timestamp_base64(filename).ext
 * @param {string} userId - The uploader's ID.
 * @param {string} fileName - The file name.
 * @returns {string} The generated file path.
 */
export declare function encodeFilePath(userId: string, fileName: string): string;
//# sourceMappingURL=strings.d.ts.map