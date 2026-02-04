import type { GenerateURL } from "@payloadcms/plugin-cloud-storage/types";
import { encodeFilePath } from "./strings";

interface Args {
    baseUrl: string;
    bucket: string;
}

export function getPublicUrl(baseUrl: string, bucket: string, prefix: string, filename: string) {
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encodeFilePath(prefix ?? "", filename)}`;
}

export const getGenerateURL = ({ baseUrl, bucket }: Args): GenerateURL => {
    return (fileInfo) => {
        return getPublicUrl(baseUrl, bucket, fileInfo.prefix ?? "", fileInfo.filename);
    };
};
