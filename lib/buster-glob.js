var buster = require("buster-core");
var g = require("glob");

module.exports = {
    glob: function (patterns, flags, cb) {
        if (typeof flags == "function") {
            cb = flags;
            flags = null;
        }

        var args = flags == null ? [] : [flags];
        buster.parallel(resolveGlobs(patterns, args), process(cb));
    }
};

function process(cb) {
    return function (err, matches) {
        cb(err, buster.flatten(matches));
    };
}

function resolveGlobs(patterns, args) {
    return array(patterns).reduce(function (fns, pattern) {
        fns.push(function (done) {
            g.glob.apply(g, [pattern].concat(args).concat([done]));
        });
        return fns;
    }, []);
}

function array(arr) {
    return Array.isArray(arr) ? arr : [arr];
}
