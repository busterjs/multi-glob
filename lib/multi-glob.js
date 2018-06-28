var glob = require("glob");
var async = require("async");

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
                    done(err, matches);
                }
            });
        });
        return fns;
    }, []);
}

function processSingle(callback) {
    return function (err, matches) {
        var results = matches.reduce(function (flattened, match) {
                return Array.isArray(match) ? flattened.concat(match) : flattened;
            }, [])
            .filter(function (match, i, flattened) {
                return flattened.indexOf(match) === i;
            });
        callback(err, results);
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
