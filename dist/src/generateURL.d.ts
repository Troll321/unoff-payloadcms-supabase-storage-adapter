import type { GenerateURL } from "@payloadcms/plugin-cloud-storage/types";
interface Args {
    baseUrl: string;
    bucket: string;
}
export declare function getPublicUrl(baseUrl: string, bucket: string, prefix: string, filename: string): string;
export declare const getGenerateURL: ({ baseUrl, bucket }: Args) => GenerateURL;
export {};
//# sourceMappingURL=generateURL.d.ts.map