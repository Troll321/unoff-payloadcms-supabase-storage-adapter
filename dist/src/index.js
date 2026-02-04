import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { getStaticHandler } from "./staticHandler.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getGenerateURL } from "./generateURL.js";
import { getHandleDelete } from "./handleDelete.js";
import { getHandleUpload } from "./handleUpload.js";
import { setEncodeName } from "./strings";
import { initClientUploads } from "@payloadcms/plugin-cloud-storage/utilities";
import { getGenerateUploadURL } from "./generateUploadURL.js";
const supabaseClients = new Map();
export const supabaseStorage = (supabaseStorageOptions) => (incomingConfig) => {
    const cacheKey = supabaseStorageOptions.clientCacheKey || `supabase:${supabaseStorageOptions.bucket}`;
    const getStorageClient = () => {
        if (supabaseClients.has(cacheKey)) {
            return supabaseClients.get(cacheKey);
        }
        supabaseClients.set(cacheKey, createClient(supabaseStorageOptions.config.baseUrl, supabaseStorageOptions.config.secret));
        return supabaseClients.get(cacheKey);
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
            const collectionsWithoutAdapter = Object.entries(supabaseStorageOptions.collections).reduce((acc, [slug, collOptions]) => ({
                ...acc,
                [slug]: {
                    ...(collOptions === true ? {} : collOptions),
                    adapter: null,
                },
            }), {});
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
    const collectionsWithAdapter = Object.entries(supabaseStorageOptions.collections).reduce((acc, [slug, collOptions]) => ({
        ...acc,
        [slug]: {
            ...(collOptions === true ? {} : collOptions),
            adapter,
        },
    }), {});
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
function supabaseStorageInternal(getStorageClient, supabaseOptions) {
    return ({ collection, prefix }) => {
        const outObj = {
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
//# sourceMappingURL=index.js.map