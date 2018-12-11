var glob = require("glob");

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
    return Promise.all(
        array(patterns).map(pattern => new Promise((resolve, reject) => {
            exports._glob(pattern, options, (err, matches) => {
              if (!err && options.strict && matches.length === 0) {
                  reject(new Error("'" + pattern + "' matched no files"));
              } else if (err) {
                  reject(err);
              } else {
                  resolve(matches);
              }
            });
        }))
    );
}

exports.glob = function (patterns, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = null;
  }

  resolveGlobs(patterns, options)
    .then(matches => cb(null, uniq(flatten(array(matches)))))
    .catch(err => cb(err));
};
