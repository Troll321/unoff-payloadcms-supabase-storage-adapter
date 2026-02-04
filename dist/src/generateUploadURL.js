import { SupabaseClient } from "@supabase/supabase-js";
import { APIError, Forbidden } from "payload";
import { encodeFilePath } from "./strings";
const bytesToMB = (bytes) => {
    return bytes / 1024 / 1024;
};
const defaultAccess = ({ req }) => !!req.user;
export const getGenerateUploadURL = ({ access = defaultAccess, bucket, collections, getStorageClient, upsert }) => {
    return async (req) => {
        if (!req.json) {
            throw new APIError("Content-Type expected to be application/json", 400);
        }
        let filesizeLimit = req.payload.config.upload.limits?.fileSize;
        if (filesizeLimit === Infinity) {
            filesizeLimit = undefined;
        }
        const { collectionSlug, filename, filesize, mimeType } = (await req.json());
        const collectionSupabaseConfig = collections[collectionSlug];
        if (!collectionSupabaseConfig) {
            throw new APIError(`Collection ${collectionSlug} was not found in Supabase options`);
        }
        const prefix = (typeof collectionSupabaseConfig === "object" && collectionSupabaseConfig.prefix) || "";
        //@ts-ignore This checking the collectionSlug to the allowed type (it works)
        if (!(await access({ collectionSlug, req }))) {
            throw new Forbidden();
        }
        const path = encodeFilePath(prefix, filename);
        if (filesizeLimit) {
            if (filesize > filesizeLimit) {
                throw new APIError(`Exceeded file size limit. Limit: ${bytesToMB(filesizeLimit).toFixed(2)}MB, got: ${bytesToMB(filesize).toFixed(2)}MB`, 400);
            }
        }
        const { data, error } = await getStorageClient()
            .storage.from(bucket)
            .createSignedUploadUrl(path, { upsert: upsert ?? false });
        if (error) {
            return Response.json(error, { status: 500 });
        }
        return Response.json({ url: data.signedUrl, bucket });
    };
};
//# sourceMappingURL=generateUploadURL.js.map