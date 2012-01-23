var B = require("buster-core");
var glob = require("glob");

function uniq(arr) {
    return arr.reduce(function (unique, item) {
        if (unique.indexOf(item) < 0) { unique.push(item); }
        return unique;
    }, []);
}

function array(arr) {
    return Array.isArray(arr) ? arr : [arr];
}

function resolveGlobs(patterns, args) {
    return array(patterns).reduce(function (fns, pattern) {
        fns.push(function (done) {
            args = [pattern].concat(args);
            glob.apply(null, args.concat([function (err, matches) {
                done(err, matches);
            }]));
        });
        return fns;
    }, []);
}

function processSingle(callback) {
    return function (err, matches) {
        callback(err, uniq(B.flatten(matches)));
    };
}

module.exports = {
    glob: function (patterns, options, cb) {
        if (typeof options === "function") {
            cb = options;
            options = null;
        }

        var args = !options ? [] : [options];
        B.parallel(resolveGlobs(patterns, args), processSingle(cb));
    }
};
