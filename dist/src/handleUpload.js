import fs from "fs";
import { SupabaseClient } from "@supabase/supabase-js";
import { encodeFilePath } from "./strings";
export const getHandleUpload = ({ bucket, getStorageClient, prefix = "", upsert = true }) => {
    return async ({ data, file }) => {
        const path = encodeFilePath(prefix, file.filename);
        const fileBufferOrStream = file.tempFilePath ? fs.createReadStream(file.tempFilePath) : file.buffer;
        if (file.buffer.length > 0) {
            const { error } = await getStorageClient().storage.from(bucket).upload(path, fileBufferOrStream, {
                upsert,
            });
            if (error) {
                throw error;
            }
            return data;
        }
        throw new Error("File can't be zero");
    };
};
//# sourceMappingURL=handleUpload.js.map