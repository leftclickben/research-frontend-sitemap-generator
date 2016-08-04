#!/bin/bash
#
# Create a package, copy it up to S3, and then deploy it into a (pre-existing) Lambda function.
#

set -e
set -u

package=research-frontend-sitemap-generator-$(date +%Y%m%d%H%M%S).zip
function=updateResearchFrontendSitemap
bucket=rwahs.lambda.code

zip -r ../${package} index.js lib config node_modules package.json
aws s3 cp ../${package} s3://rwahs.lambda.code/${package}
aws lambda update-function-code --function-name ${function} --s3-bucket ${bucket} --s3-key ${package}
