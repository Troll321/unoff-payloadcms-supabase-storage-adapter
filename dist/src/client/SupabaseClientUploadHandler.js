"use client";
import { createClientUploadHandler } from "@payloadcms/plugin-cloud-storage/client";
import { formatAdminURL } from "payload/shared";
export const SupabaseClientUploadHandler = createClientUploadHandler({
    handler: async ({ apiRoute, collectionSlug, file, prefix, serverHandlerPath, serverURL }) => {
        const endpointRoute = formatAdminURL({
            apiRoute,
            path: serverHandlerPath,
            serverURL,
        });
        const filesize = file.size + 32;
        const response = await fetch(endpointRoute, {
            body: JSON.stringify({
                collectionSlug,
                filename: file.name,
                filesize: filesize,
                mimeType: file.type,
            }),
            credentials: "include",
            method: "POST",
        });
        if (!response.ok) {
            const { errors } = (await response.json());
            throw errors;
        }
        const { url, bucket } = (await response.json());
        await fetch(url, {
            body: file,
            headers: { "Content-Length": filesize.toString(), "Content-Type": file.type },
            method: "PUT",
        });
        return { prefix, bucket };
    },
});
//# sourceMappingURL=SupabaseClientUploadHandler.js.map