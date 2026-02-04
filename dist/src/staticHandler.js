import { getFilePrefix } from "@payloadcms/plugin-cloud-storage/utilities";
import { SupabaseClient } from "@supabase/supabase-js";
import { encodeFilePath } from "./strings";
import { getPublicUrl } from "./generateURL.js";
export const getStaticHandler = ({ bucket, collection, getStorageClient, baseUrl, signedDownloads, isPublic }) => {
    return async (req, { headers: incomingHeaders, params: { clientUploadContext, filename } }) => {
        try {
            const prefix = await getFilePrefix({ clientUploadContext, collection, filename, req });
            if (isPublic) {
                return Response.redirect(getPublicUrl(baseUrl, bucket, prefix, filename), 302);
            }
            const path = encodeFilePath(prefix, filename);
            if (signedDownloads) {
                let expiresSecond = 60 * 5;
                if (typeof signedDownloads === "object") {
                    expiresSecond = signedDownloads.expiresInS ?? expiresSecond;
                }
                const { data, error } = await getStorageClient().storage.from(bucket).createSignedUrl(path, expiresSecond);
                if (error) {
                    throw error;
                }
                return Response.redirect(data.signedUrl, 302);
            }
            const { data, error } = await getStorageClient().storage.from(bucket).download(path);
            if (error) {
                throw error;
            }
            return new Response(data);
        }
        catch (err) {
            if (err && typeof err === "object" && (("name" in err && (err.name === "NoSuchKey" || err.name === "NotFound")) || ("httpStatusCode" in err && err.httpStatusCode === 404))) {
                return new Response(null, { status: 404, statusText: "Not Found" });
            }
            req.payload.logger.error(err);
            return new Response("Internal Server Error", { status: 500 });
        }
    };
};
//# sourceMappingURL=staticHandler.js.map