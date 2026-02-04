import { encodeFilePath } from "./strings";
export function getPublicUrl(baseUrl, bucket, prefix, filename) {
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encodeFilePath(prefix ?? "", filename)}`;
}
export const getGenerateURL = ({ baseUrl, bucket }) => {
    return (fileInfo) => {
        return getPublicUrl(baseUrl, bucket, fileInfo.prefix ?? "", fileInfo.filename);
    };
};
//# sourceMappingURL=generateURL.js.map