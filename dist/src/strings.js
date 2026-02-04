let encodeName = true;
export function setEncodeName(val) {
    encodeName = val;
}
/**
 * Base64 URL encodes a string.
 * @param {string} str - The string to encode.
 * @returns {string} The encoded string.
 */
export function base64UrlEncode(str) {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/**
 * Base64 URL decodes a string.
 * @param {string} str - The string to decode.
 * @returns {string} The decoded string.
 */
export function base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) {
        str += "=";
    }
    return atob(str);
}
/**
 * Generates a unique file path for uploads.
 * Structure: base64(userId)/timestamp_base64(filename).ext
 * @param {string} userId - The uploader's ID.
 * @param {string} fileName - The file name.
 * @returns {string} The generated file path.
 */
export function encodeFilePath(userId, fileName) {
    const lastDot = fileName.lastIndexOf(".");
    let baseName, extension;
    if (lastDot === -1) {
        baseName = fileName;
        extension = "unknown";
    }
    else {
        baseName = lastDot === -1 ? fileName : fileName.slice(0, lastDot);
        extension = lastDot === -1 ? "" : fileName.slice(lastDot + 1);
    }
    if (encodeName) {
        return `${base64UrlEncode(userId)}/${base64UrlEncode(baseName)}.${extension}`;
    }
    else {
        return `${userId}/${baseName}.${extension}`;
    }
}
//# sourceMappingURL=strings.js.map