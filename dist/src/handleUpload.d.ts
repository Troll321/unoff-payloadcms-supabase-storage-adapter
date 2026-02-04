import type { HandleUpload } from "@payloadcms/plugin-cloud-storage/types";
import { SupabaseClient } from "@supabase/supabase-js";
interface Args {
    bucket: string;
    getStorageClient: () => SupabaseClient;
    prefix?: string;
    upsert?: boolean;
}
export declare const getHandleUpload: ({ bucket, getStorageClient, prefix, upsert }: Args) => HandleUpload;
export {};
//# sourceMappingURL=handleUpload.d.ts.map