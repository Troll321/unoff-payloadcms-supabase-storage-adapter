import type { StaticHandler } from "@payloadcms/plugin-cloud-storage/types";
import type { CollectionConfig } from "payload";
import { SupabaseClient } from "@supabase/supabase-js";
export type SignedDownloadsConfig = {
    /** @default 300 */
    expiresInS?: number;
} | boolean;
interface Args {
    bucket: string;
    collection: CollectionConfig;
    getStorageClient: () => SupabaseClient;
    baseUrl: string;
    signedDownloads?: SignedDownloadsConfig;
    isPublic?: boolean;
}
export declare const getStaticHandler: ({ bucket, collection, getStorageClient, baseUrl, signedDownloads, isPublic }: Args) => StaticHandler;
export {};
//# sourceMappingURL=staticHandler.d.ts.map