var buster = require("buster");
var glob = require("glob");
var g = require("../lib/buster-glob");

buster.testCase("Buster glob", {
    setUp: function () {
        this.stub(glob, "glob");
    },

    "calls glob with pattern": function () {
        g.glob("lib/buster.js");

        assert.calledOnceWith(glob.glob, "lib/buster.js");
    },

    "calls glob with provided flags": function () {
        g.glob("lib/buster.js", glob.GLOB_DEFAULT);

        assert.calledOnceWith(glob.glob, "lib/buster.js", glob.GLOB_DEFAULT);
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
