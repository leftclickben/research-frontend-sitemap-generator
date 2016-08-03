#!/usr/bin/env node
(function (_, request, xmlbuilder, fs) {
    'use strict';

    module.exports = function (environment, callback) {
        var pathFor, entryFor, types, fixedUrls, config;

        // Get the URL path for the given object.
        pathFor = (object) => '/' + types[object.type] + '/detail/' + object.object_id;

        // Get the <url> element entry for the given parameters (path and priority).
        entryFor = (params) => ({
            loc: { '#text': config.frontend.protocol + '://' + config.frontend.hostname + params.path },
            priority: { '#text': params.priority }
        });

        // Load configuration.
        types = require('../config/types.json');
        fixedUrls = require('../config/fixed-urls.json');
        config = require('../config/config.' + environment + '.json');

        // Load the data and write it to `sitemap.xml`.
        request(
            config.service.protocol + '://' + config.service.username + ':' + config.service.password + '@' + config.service.hostname + '/service.php/simple/sitemap_search?q=*&noCache=1',
            function (err, response) {
                var data;

                if (err) {
                    return callback(err);
                }

                data = JSON.parse(response.body);
                if (!data || !data.ok) {
                    return callback(Error('Invalid data returned: ' + response.body));
                }
                delete data.ok;

                fs.writeFile(
                    'sitemap.xml',
                    xmlbuilder
                        .create({
                            urlset: {
                                url: _.concat(
                                    _(fixedUrls).map(entryFor).value(),
                                    _(data).values().map((object) => entryFor({ path: pathFor(object), priority: 0.5 })).value()
                                )
                            }
                        })
                        .end({ pretty: true }),
                    callback
                );
            }
        );
    };

    // Allow this module to be run as a script.
    if (require.main === module) {
        let environment = process.env.NODE_ENV || 'development';
        console.log('Generating sitemap.xml in "%s" environment.', environment);
        module.exports(environment, function (err) {
            if (err) {
                console.error('Generator finished with an error: ', err);
            } else {
                console.log('Done.');
            }
        });
    }
}(require('lodash'), require('request'), require('xmlbuilder'), require('fs')));
