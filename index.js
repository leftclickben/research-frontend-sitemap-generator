#!/usr/bin/env node
(function (generate, upload) {
    'use strict';

    exports.handler = function (event, context, callback) {
        var environment = event.environment;
        console.log('Generating and deploying sitemap.xml to "%s" environment.', environment);
        generate(environment, function (err) {
            if (err) {
                console.error('Generation of sitemap.xml failed: ', err);
                return callback(err);
            }
            upload(environment, function (err) {
                if (err) {
                    console.error('Deployment finished with an error: ', err);
                    return callback(err);
                }
                console.log('Done.');
                callback();
            })
        });
    };

    // Allow this module to be run as a script.
    if (require.main === module) {
        let environment = process.env.NODE_ENV || 'development';
        exports.handler({ environment: environment }, {}, () => {});
    }
}(require('./lib/generate'), require('./lib/upload')));
