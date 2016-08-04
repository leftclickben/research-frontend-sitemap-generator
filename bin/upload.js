#!/usr/bin/env node
(function (fs, aws) {
    'use strict';

    module.exports = function (environment, callback) {
        var config, s3;

        // Load configuration.
        config = require('../config/config.' + environment + '.json');

        // Check the environment allows deployments.
        if (!config.deploy) {
            return callback(new Error('The "' + environment + '" environment does not support deployment'));
        }

        // Check the file exists.
        if (!fs.existsSync('sitemap.xml')) {
            return callback(new Error('File not found "sitemap.xml"; please run `generate.js` first'));
        }

        // Copy the file up to S3.
        s3 = new aws.S3();
        s3.putObject(
            {
                Bucket: config.deploy.bucket,
                Key: 'sitemap.xml',
                ContentType: 'application/xml',
                Body: fs.createReadStream('sitemap.xml')
            },
            callback
        );
    };

    // Allow this module to be run as a script.
    if (require.main === module) {
        let environment = process.env.NODE_ENV || 'development';
        console.log('Deploying sitemap.xml to "%s" environment.', environment);
        module.exports(environment, function (err) {
            if (err) {
                console.error('Deployment finished with an error: ', err);
            } else {
                console.log('Done.');
            }
        });
    }
}(require('fs'), require('aws-sdk')));
