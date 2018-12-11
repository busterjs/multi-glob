var glob = require("glob");
var async = require("async");

exports._glob = glob;

function uniq(xs) {
    return xs.reduce((unique, x) => {
        return unique.indexOf(x) < 0 ? unique.concat(x) : unique;
    }, []);
}

function flatten(xs) {
    return xs.reduce((flattened, x) => {
        return flattened.concat(Array.isArray(x) ? flatten(x) : x);
    }, []);
}

function array(arr) {
    return Array.isArray(arr) ? arr : [arr];
}

function resolveGlobs(patterns, options) {
    options = options || {};
    return array(patterns).reduce(function (fns, pattern) {
        fns.push(function (done) {
            exports._glob(pattern, options, function (err, matches) {
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
        callback(err, uniq(flatten(array(matches))));
    };
}

exports.glob = function (patterns, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = null;
  }
  async.parallel(resolveGlobs(patterns, options), processSingle(cb));
};
