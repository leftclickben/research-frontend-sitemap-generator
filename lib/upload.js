#!/usr/bin/env node
(function (fs, aws) {
    'use strict';

    module.exports = function (environment, callback) {
        var config, sourceFilename, s3;

        // Load configuration.
        config = require('../config/config.' + environment + '.json');

        // Check the environment allows upload.
        if (!config.upload) {
            return callback(new Error('The "' + environment + '" environment does not support upload.'));
        }

        // Check the file exists.
        sourceFilename = config.generate.path + 'sitemap.xml';
        if (!fs.existsSync(sourceFilename)) {
            return callback(new Error('File not found "' + sourceFilename + '"; please run `generate.js` first.'));
        }

        // Use the specified profile.
        if (config.upload.profile) {
            aws.config.credentials = new aws.SharedIniFileCredentials({ profile: config.upload.profile });
        }

        // Copy the file up to S3.
        s3 = new aws.S3();
        s3.putObject(
            {
                Bucket: config.upload.bucket,
                Key: 'sitemap.xml',
                ContentType: 'application/xml',
                Body: fs.createReadStream(sourceFilename)
            },
            callback
        );
    };

    // Allow this module to be run as a script.
    if (require.main === module) {
        let environment = process.env.NODE_ENV || 'development';
        console.log('Uploading sitemap.xml to "%s" environment.', environment);
        module.exports(environment, function (err) {
            if (err) {
                console.error('Upload finished with an error: ', err);
            } else {
                console.log('Done.');
            }
        });
    }
}(require('fs'), require('aws-sdk')));
