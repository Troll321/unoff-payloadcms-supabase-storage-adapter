import type { ClientUploadsAccess } from "@payloadcms/plugin-cloud-storage/types";
import { SupabaseClient } from "@supabase/supabase-js";
import type { PayloadHandler } from "payload";
import type { SupabaseStorageOptions } from "./index.js";
interface Args {
    access?: ClientUploadsAccess;
    bucket: string;
    collections: SupabaseStorageOptions["collections"];
    getStorageClient: () => SupabaseClient;
    upsert?: boolean;
}
export declare const getGenerateUploadURL: ({ access, bucket, collections, getStorageClient, upsert }: Args) => PayloadHandler;
export {};
//# sourceMappingURL=generateUploadURL.d.ts.map