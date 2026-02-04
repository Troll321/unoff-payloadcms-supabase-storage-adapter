export type SupabaseStorageOptions = {
/**
_ Bucket name to upload files to.
_
_ Must follow [AWS S3 bucket naming conventions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).
_/
bucket: string;
/**
_ When true will override existing file, else throw an error
_ @default true
_/
upsert?: boolean;
/\*\*
_ Check to true if the bucket is public
_ @default false
_/
isPublic: boolean;
/**
_ Collection options to apply the Supabase adapter to.
_/
collections: Partial<Record<UploadCollectionSlug, ({
signedDownloads?: SignedDownloadsConfig;
} & Omit<CollectionOptions, "adapter">) | true>>;
/**
_ When enabled, fields (like the prefix field) will always be inserted into
_ the collection schema regardless of whether the plugin is enabled. This
_ ensures a consistent schema across all environments.
_
_ This will be enabled by default in Payload v4.
_
_ @default false
_/
alwaysInsertFields?: boolean;
/**
_ Optional cache key to identify the Supabase storage client instance.
_ If not provided, a default key will be used. \*
_ @default `supabase:containerName`
_/
clientCacheKey?: string;
/**
_ Do uploads directly on the client to bypass limits on Vercel. You must allow CORS PUT method for the bucket to your website.
_/
clientUploads?: ClientUploadsConfig;
/**
_ AWS Supabase client configuration. Highly dependent on your AWS setup.
_
\*/
config: SupabaseStorageConfig;
/**
_ Whether or not to enable the plugin
_
_ Default: true
_/
enabled?: boolean;
/**
_ Use pre-signed URLs for files downloading. Can be overriden per-collection.
_/
signedDownloads?: SignedDownloadsConfig;
/**
_ If true, on supabase it will be encoded but on Payload you could upload any filename you like
_ If false, you are responsible for your own file name / prefix name
_ @default true
_/
encodeName?: boolean;
};
