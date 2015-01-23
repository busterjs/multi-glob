var glob = require("glob");
var async = require("async");
var _ = require("lodash");

function array(arr) {
    return Array.isArray(arr) ? arr : [arr];
}

function resolveGlobs(patterns, options) {
    options = options || {};
    return array(patterns).reduce(function (fns, pattern) {
        fns.push(function (done) {
            glob(pattern, options, function (err, matches) {
                if (!err && options.strict && matches.length === 0) {
                    done(new Error("'" + pattern + "' matched no files"));
                } else {
                    done(err, {
                        action: pattern[0] === '!' ? 'exclude' : 'include',
                        matches: matches
                    });
                }
            });
        });
        return fns;
    }, []);
}

function processSingle(callback) {
    return function (err, matches) {
        matches = _.toArray(matches);
        var includes = _.flatten(matches.filter(function(match) {
            return match && match.action === 'include';
        }).map(function(match) {
            return match.matches;
        }));

        var excludes = _.flatten(matches.filter(function(match) {
            return match && match.action === 'exclude';
        }).map(function(match) {
            return match.matches;
        }));

        var finalMatches = _.difference(includes, excludes);
        callback(err, _.uniq(finalMatches));
    };
}

module.exports = {
    glob: function (patterns, options, cb) {
        if (typeof options === "function") {
            cb = options;
            options = null;
        }
        async.parallel(resolveGlobs(patterns, options), processSingle(cb));
    }
};
