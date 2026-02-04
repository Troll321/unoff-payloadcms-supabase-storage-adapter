import { SupabaseClient } from "@supabase/supabase-js";
import { encodeFilePath } from "./strings";
export const getHandleDelete = ({ bucket, getStorageClient }) => {
    return async ({ doc: { prefix = "" }, filename }) => {
        const { data, error } = await getStorageClient()
            .storage.from(bucket)
            .remove([encodeFilePath(prefix, filename)]);
        if (error) {
            throw error;
        }
    };
};
//# sourceMappingURL=handleDelete.js.map