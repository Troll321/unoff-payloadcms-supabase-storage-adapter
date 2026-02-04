import type { CollectionOptions, ClientUploadsConfig } from "@payloadcms/plugin-cloud-storage/types";
import type { Plugin, UploadCollectionSlug } from "payload";
import { type SignedDownloadsConfig } from "./staticHandler.js";
interface SupabaseStorageConfig {
    baseUrl: string;
    secret: string;
}
export type SupabaseStorageOptions = {
    /**
     * Bucket name to upload files to.
     *
     * Must follow [AWS S3 bucket naming conventions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).
     */
    bucket: string;
    /**
     * When true will override existing file, else throw an error
     * @default true
     */
    upsert?: boolean;
    /**
     * Check to true if the bucket is public
     * @default false
     */
    isPublic: boolean;
    /**
     * Collection options to apply the Supabase adapter to.
     */
    collections: Partial<Record<UploadCollectionSlug, ({
        signedDownloads?: SignedDownloadsConfig;
    } & Omit<CollectionOptions, "adapter">) | true>>;
    /**
     * When enabled, fields (like the prefix field) will always be inserted into
     * the collection schema regardless of whether the plugin is enabled. This
     * ensures a consistent schema across all environments.
     *
     * This will be enabled by default in Payload v4.
     *
     * @default false
     */
    alwaysInsertFields?: boolean;
    /**
     * Optional cache key to identify the Supabase storage client instance.
     * If not provided, a default key will be used.
     *
     * @default `supabase:containerName`
     */
    clientCacheKey?: string;
    /**
     * Do uploads directly on the client to bypass limits on Vercel. You must allow CORS PUT method for the bucket to your website.
     */
    clientUploads?: ClientUploadsConfig;
    /**
     * Supabase client configuration. Highly dependent on your AWS setup.
     *
     */
    config: SupabaseStorageConfig;
    /**
     * Whether or not to enable the plugin
     *
     * Default: true
     */
    enabled?: boolean;
    /**
     * Use pre-signed URLs for files downloading. Can be overriden per-collection.
     */
    signedDownloads?: SignedDownloadsConfig;
    /**
     * If true, on supabase it will be encoded but on Payload you could upload any filename you like
     * If false, you are responsible for your own file name / prefix name
     * @default true
     */
    encodeName?: boolean;
};
type SupabaseStoragePlugin = (storageSupabaseArgs: SupabaseStorageOptions) => Plugin;
export declare const supabaseStorage: SupabaseStoragePlugin;
export {};
//# sourceMappingURL=index.d.ts.map