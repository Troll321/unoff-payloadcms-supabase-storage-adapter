import type { Adapter, PluginOptions as CloudStoragePluginOptions, CollectionOptions, GeneratedAdapter, ClientUploadsConfig } from "@payloadcms/plugin-cloud-storage/types";
import type { Config, Plugin, UploadCollectionSlug } from "payload";

import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";

import { getStaticHandler, type SignedDownloadsConfig } from "./staticHandler.js";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getGenerateURL } from "./generateURL.js";
import { getHandleDelete } from "./handleDelete.js";
import { getHandleUpload } from "./handleUpload.js";
import { setEncodeName } from "./strings";
import { initClientUploads } from "@payloadcms/plugin-cloud-storage/utilities";
import { getGenerateUploadURL } from "./generateUploadURL.js";

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
    collections: Partial<
        Record<
            UploadCollectionSlug,
            | ({
                  signedDownloads?: SignedDownloadsConfig;
              } & Omit<CollectionOptions, "adapter">)
            | true
        >
    >;

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

const supabaseClients = new Map<string, SupabaseClient>();

type SupabaseStoragePlugin = (storageSupabaseArgs: SupabaseStorageOptions) => Plugin;

export const supabaseStorage: SupabaseStoragePlugin =
    (supabaseStorageOptions: SupabaseStorageOptions) =>
    (incomingConfig: Config): Config => {
        const cacheKey = supabaseStorageOptions.clientCacheKey || `supabase:${supabaseStorageOptions.bucket}`;

        const getStorageClient: () => SupabaseClient = () => {
            if (supabaseClients.has(cacheKey)) {
                return supabaseClients.get(cacheKey)!;
            }

            supabaseClients.set(cacheKey, createClient(supabaseStorageOptions.config.baseUrl, supabaseStorageOptions.config.secret));

            return supabaseClients.get(cacheKey)!;
        };

        if (supabaseStorageOptions.encodeName === false) {
            setEncodeName(false);
        }

        const isPluginDisabled = supabaseStorageOptions.enabled === false;

        initClientUploads({
            clientHandler: "unoff-payloadcms-supabase-storage-adapter/client#SupabaseClientUploadHandler",
            collections: supabaseStorageOptions.collections,
            config: incomingConfig,
            enabled: !isPluginDisabled && Boolean(supabaseStorageOptions.clientUploads),
            serverHandler: getGenerateUploadURL({
                access: typeof supabaseStorageOptions.clientUploads === "object" ? supabaseStorageOptions.clientUploads.access : undefined,
                bucket: supabaseStorageOptions.bucket,
                collections: supabaseStorageOptions.collections,
                getStorageClient,
                upsert: supabaseStorageOptions.upsert,
            }),
            serverHandlerPath: "/storage-supabase-generate-signed-url",
        });

        if (isPluginDisabled) {
            // If alwaysInsertFields is true, still call cloudStoragePlugin to insert fields
            if (supabaseStorageOptions.alwaysInsertFields) {
                // Build collections with adapter: null since plugin is disabled
                const collectionsWithoutAdapter: CloudStoragePluginOptions["collections"] = Object.entries(supabaseStorageOptions.collections).reduce(
                    (acc, [slug, collOptions]) => ({
                        ...acc,
                        [slug]: {
                            ...(collOptions === true ? {} : collOptions),
                            adapter: null,
                        },
                    }),
                    {} as Record<string, CollectionOptions>,
                );

                return cloudStoragePlugin({
                    alwaysInsertFields: true,
                    collections: collectionsWithoutAdapter,
                    enabled: false,
                })(incomingConfig);
            }

            return incomingConfig;
        }

        const adapter = supabaseStorageInternal(getStorageClient, supabaseStorageOptions);

        // Add adapter to each collection option object
        const collectionsWithAdapter: CloudStoragePluginOptions["collections"] & Record<string, CollectionOptions> = Object.entries(supabaseStorageOptions.collections).reduce(
            (acc, [slug, collOptions]) => ({
                ...acc,
                [slug]: {
                    ...(collOptions === true ? {} : collOptions),
                    adapter,
                },
            }),
            {} as Record<string, CollectionOptions>,
        );

        // Set disableLocalStorage: true for collections specified in the plugin options
        const config = {
            ...incomingConfig,
            collections: (incomingConfig.collections || []).map((collection) => {
                if (!collectionsWithAdapter[collection.slug]) {
                    return collection;
                }

                return {
                    ...collection,
                    upload: {
                        ...(typeof collection.upload === "object" ? collection.upload : {}),
                        disableLocalStorage: true,
                    },
                };
            }),
        };

        return cloudStoragePlugin({
            alwaysInsertFields: supabaseStorageOptions.alwaysInsertFields,
            collections: collectionsWithAdapter,
        })(config);
    };

function supabaseStorageInternal(getStorageClient: () => SupabaseClient, supabaseOptions: SupabaseStorageOptions): Adapter {
    return ({ collection, prefix }): GeneratedAdapter => {
        const outObj: GeneratedAdapter = {
            name: "supabase",
            clientUploads: supabaseOptions.clientUploads,
            handleDelete: getHandleDelete({ getStorageClient, bucket: supabaseOptions.bucket }),
            handleUpload: getHandleUpload({
                bucket: supabaseOptions.bucket,
                getStorageClient,
                prefix,
                upsert: supabaseOptions.upsert,
            }),
            staticHandler: getStaticHandler({
                bucket: supabaseOptions.bucket,
                collection,
                baseUrl: supabaseOptions.config.baseUrl,
                getStorageClient,
                signedDownloads: supabaseOptions.signedDownloads ?? false,
                isPublic: supabaseOptions.isPublic,
            }),
        };
        if (supabaseOptions.isPublic) {
            outObj.generateURL = getGenerateURL({
                baseUrl: supabaseOptions.config.baseUrl,
                bucket: supabaseOptions.bucket,
            });
        }
        return outObj;
    };
}
