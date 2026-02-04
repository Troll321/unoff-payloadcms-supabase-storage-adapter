import type { HandleDelete } from "@payloadcms/plugin-cloud-storage/types";
import { SupabaseClient } from "@supabase/supabase-js";
interface Args {
    bucket: string;
    getStorageClient: () => SupabaseClient;
}
export declare const getHandleDelete: ({ bucket, getStorageClient }: Args) => HandleDelete;
export {};
//# sourceMappingURL=handleDelete.d.ts.map