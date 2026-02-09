# The unofficial payloadcms supabase storage adapter

This is basically a stripped down version from @payloadcms/storage-s3 that uses @supabase/supabase-js. This is created due to the frustation in setting up s3 for supabase :V

### Installation

`npm install unoff-payloadcms-supabase-storage-adapter`

**Set your payload version to 3.74.0**, as for now this package doesn't support other than the specified version.

**Generate importmap!** See the official payload docs for further information.
`npm run payload generate:importmap`

### Working Example

```ts
buildConfig({
	...your payload config
	plugins: [
	    supabaseStorage({
			bucket:  process.env.SUPABASE_BUCKET!,
			collections: {
				files: { // <-- "files" is your upload collection name
					disableLocalStorage:  true,
					disablePayloadAccessControl:  true,
					prefix:  "files",
					signedDownloads:  true,
				},
			},
			upsert:  true,
			signedDownloads:  true,
			config: {
				baseUrl:  process.env.SUPABASE_BASE_URL!, // https://<projectName>.supabase.co
				secret:  process.env.SUPABASE_SECRET!, // sb_secret_... Make sure this secret has permission
			},
			isPublic:  true // set this to true on public bucket
		}),
]})
```

## Config Options

```ts
export type SupabaseStorageOptions = {
* Bucket name to upload files to.
* Must follow [AWS S3 bucket naming conventions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).
*/
bucket: string;

/**
* When true will override existing file, else throw an error
* @default true
*/
upsert?: boolean;

/**
* Check to true if the bucket is public
* @default false
*/
isPublic: boolean;

/**
* Collection options to apply the Supabase adapter to.
*/
collections: Partial<Record<UploadCollectionSlug,  ({signedDownloads?:  SignedDownloadsConfig;
}  &  Omit<CollectionOptions,  "adapter">) | true>>;

/**
* When enabled, fields (like the prefix field) will always be inserted into
* the collection schema regardless of whether the plugin is enabled. This
* ensures a consistent schema across all environments.
*
* This will be enabled by default in Payload v4.
*
* @default false
*/
alwaysInsertFields?: boolean;

/**
* Optional cache key to identify the Supabase storage client instance.
* If not provided, a default key will be used.
*
* @default `supabase:containerName`
*/
clientCacheKey?: string;

/**
* Do uploads directly on the client to bypass 4.5 mb limits on Vercel. You must allow CORS PUT method for the bucket to your website.
* As for now, this still couldn't be used
*/
clientUploads?: ClientUploadsConfig;

/**
* Supabase client configuration.
*/
config: SupabaseStorageConfig;

/**
* Whether or not to enable the plugin
*
* Default: true
*/
enabled?: boolean;

/**
* Use pre-signed URLs for files downloading. Can be overriden per-collection.
*/
signedDownloads?: SignedDownloadsConfig;

/**
* If true, on supabase it will be base64url encoded but on Payload you could upload any filename you like
* If false, you are responsible for your own file name / prefix name
* @default true
*/
encodeName?: boolean;

};
```

## NOTES!

- Currently **Sharp** and **crop / focalpoint** feature is **not supported**, don't use it (it will throw an error)
- **clientUpload** as for now is still **error** (it is presumed that the problem is on Payload)
- Some feature from the original s3 storage might not exists here
- Oh yeah, beside the working example (it is untested :v)
