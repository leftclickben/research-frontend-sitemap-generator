# Research Frontend Sitemap Generator

Generates sitemap.xml for the research frontend based on a search service call.

Intended to be run in AWS Lambda and upload files to AWS S3.

## Setup

Install Node.js (e.g. via nvm or via nodesource PPAs), then install dependencies via npm:

```
npm install
```

Also your `NODE_ENV` environment variable needs to be configured correctly.  It defaults to `development`, so no
setting is necessary in development environments.  In deployed environments, it can be added to `/etc/environment`.
It can also be set when running a command, like `NODE_ENV=staging bin/<command>`.

Finally, you will need some AWS credentials stored in your `.aws/config` file in the `rwahs` profile.

## Concept of Operation

1. Call the CA web service to retrieve a list of all the available objects.
2. Convert a list of "fixed urls" from `config/fixed-urls.json` into sitemap.xml entries.
3. Convert the list of objects into sitemap.xml entries using the type map defined in `config/types.json`.
4. Output the combined entries into `sitemap.xml`.
5. Upload the `sitemap.xml` to a configured S3 bucket.

## Web Service Endpoint

The web service endpoint needs to be configured as follows:

```
sitemap_search = {
    type = search,
    table = ca_objects,
    checkAccess = [ 1 ],
    content = {
        object_id = ^ca_objects.object_id,
        type = ^type_id
    }
}
```

Additional fields are allowed, but unused.

## Execution

To generate a sitemap:

```
bin/generate.js
```

This calls the web service as defined in `config/config.<NODE_ENV>.json` and saves its output as `sitemap.xml`.
