import type { HandleDelete } from "@payloadcms/plugin-cloud-storage/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { encodeFilePath } from "./strings";

interface Args {
    bucket: string;
    getStorageClient: () => SupabaseClient;
}

export const getHandleDelete = ({ bucket, getStorageClient }: Args): HandleDelete => {
    return async ({ doc: { prefix = "" }, filename }) => {
        const { data, error } = await getStorageClient()
            .storage.from(bucket)
            .remove([encodeFilePath(prefix, filename)]);

        if (error) {
            throw error;
        }
    };
};
