var buster = require("buster");
var sinon = require("sinon");
var bc = require("buster-core");
var glob = { glob: sinon.stub() };
var vm = require("vm");
var fs = require("fs");

var sandbox = {
    require: function (name) {
        return name == "buster-core" ? bc : function () {
            return glob.glob.apply(glob, arguments);
        };
    },
    module: {}
};

var lib = require("path").join(__dirname, "../lib/buster-glob.js");
var code = fs.readFileSync(lib, "utf-8");
vm.runInNewContext(code, sandbox);
var g = sandbox.module.exports;

buster.testCase("Buster glob", {
    setUp: function () {
        glob.glob = this.stub();
    },

    "calls glob with pattern": function () {
        g.glob("lib/buster.js");

        assert.calledOnceWith(glob.glob, "lib/buster.js");
    },

    "calls glob with provided flags": function () {
        var args = { silent: true };
        g.glob("lib/buster.js", args);

        assert.calledOnceWith(glob.glob, "lib/buster.js", args);
    },

    "does not call glob with flags when none are provided": function () {
        g.glob("lib/buster.js");

        assert.equals(glob.glob.args[0].length, 2);
        assert.isFunction(glob.glob.args[0][1]);
    },

    "calls glob once with each pattern": function () {
        g.glob(["lib/buster.js", "src/buster.js"]);

        assert.calledTwice(glob.glob);
        assert.calledWith(glob.glob, "lib/buster.js");
        assert.calledWith(glob.glob, "src/buster.js");
    },

    "calls glob once with each pattern": function () {
        g.glob(["lib/buster.js", "src/buster.js"]);

        assert.calledTwice(glob.glob);
        assert.calledWith(glob.glob, "lib/buster.js");
        assert.calledWith(glob.glob, "src/buster.js");
    },

    "calls callback with results from glob": function () {
        var callback = this.spy();
        glob.glob.yields(null, ["lib/buster.js"]);

        g.glob("lib/buster.js", callback);

        assert.calledOnceWith(callback, null, ["lib/buster.js"]);
    },

    "calls callback with combnined results from glob": function () {
        var callback = this.spy();
        glob.glob.withArgs("lib/buster.js").yields(null, ["lib/buster.js"]);
        glob.glob.withArgs("src/*.js").yields(null, ["src/buster.js", "src/stuff.js"]);

        g.glob(["lib/buster.js", "src/*.js"], callback);

        assert.calledWith(callback, null,
                          ["lib/buster.js", "src/buster.js", "src/stuff.js"]);
    },

    "calls callback once with glob error": function () {
        var callback = this.spy();
        glob.glob.withArgs("lib/buster.js").yields({ message: "Oh no" });
        glob.glob.withArgs("src/*.js").yields(null, ["src/buster.js", "src/stuff.js"]);

        g.glob(["lib/buster.js", "src/*.js"], callback);

        assert.calledWith(callback, { message: "Oh no" });
    },

    "ignore duplicated items from glob": function () {
        var callback = this.spy();
        glob.glob.withArgs("src/foo.js").yields(null, ["src/foo.js"]);
        glob.glob.withArgs("src/*.js").yields(null, ["src/foo.js", "src/bar.js"]);

        g.glob(["src/foo.js", "src/*.js"], callback);

        assert.calledWith(callback, null, ["src/foo.js", "src/bar.js"]);
    }
});
