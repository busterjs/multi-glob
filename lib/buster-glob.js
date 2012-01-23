var B = require("buster-core");
var glob = require("glob");

module.exports = {
    glob: function (patterns, options, cb) {
        if (typeof options == "function") {
            cb = options;
            options = null;
        }

        var args = options == null ? [] : [options];
        B.parallel(resolveGlobs(patterns, args), process(cb));
    }
};

function process(cb) {
    return function (err, matches) {
        cb(err, uniq(B.flatten(matches)));
    };
}

function resolveGlobs(patterns, args) {
    return array(patterns).reduce(function (fns, pattern) {
        fns.push(function (done) {
            glob.apply(null, [pattern].concat(args).concat([function (err, matches) {
                done(err, matches);
            }]));
        });
        return fns;
    }, []);
}

function array(arr) {
    return Array.isArray(arr) ? arr : [arr];
}

function uniq(arr) {
    return arr.reduce(function (unique, item) {
        if (unique.indexOf(item) < 0) unique.push(item);
        return unique;
    }, []);
}
