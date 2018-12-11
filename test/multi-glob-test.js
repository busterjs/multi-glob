/*global describe, beforeEach, afterEach, it*/
const {sinon, assert} = require("@sinonjs/referee-sinon");
const multiGlob = require("../lib/multi-glob.js");

describe("Multi-glob", function () {
  var nodeGlobStub;

  beforeEach(function () {
    nodeGlobStub = sinon.stub(multiGlob, "_glob");
  });

  afterEach(function () {
    multiGlob._glob.restore();
  });

  it("calls glob with pattern", function () {
    multiGlob.glob("lib/buster.js", () => {});

    assert.calledOnceWith(nodeGlobStub, "lib/buster.js");
  });

  it("calls glob with provided options", function () {
    var args = { silent: true };
    multiGlob.glob("lib/buster.js", args, () => {});

    assert.calledOnceWith(nodeGlobStub, "lib/buster.js", args);
  });

  it("calls glob with empty options when none are provided", function () {
    multiGlob.glob("lib/buster.js", () => {});
    assert.equals(nodeGlobStub.args[0].length, 3);
    assert.isFunction(nodeGlobStub.args[0][2]);
  });

  it("calls glob once with each pattern", function () {
    multiGlob.glob(["lib/buster.js", "src/buster.js"], () => {});

    assert.calledTwice(nodeGlobStub);
    assert.calledWith(nodeGlobStub, "lib/buster.js");
    assert.calledWith(nodeGlobStub, "src/buster.js");
  });

  it("calls callback with result from glob", function (done) {
    nodeGlobStub.yields(null, ["lib/buster.js"]);

    multiGlob.glob("lib/buster.js", function (err, res) {
      assert.isNull(err);
      assert.equals(res, ["lib/buster.js"]);
      done();
    });
  });

  it("calls callback with combined results from glob", function (done) {
    nodeGlobStub.withArgs("lib/buster.js").yields(null, ["lib/buster.js"]);
    var files = ["src/buster.js", "src/stuff.js"];
    nodeGlobStub.withArgs("src/*.js").yields(null, files);

    multiGlob.glob(["lib/buster.js", "src/*.js"], function (err, res) {
      assert.isNull(err);
      assert.equals(res, ["lib/buster.js", "src/buster.js", "src/stuff.js"]);
      done();
    });
  });

  it("calls callback once with glob error", function (done) {
    nodeGlobStub.withArgs("lib/buster.js").yields({ message: "Oh no" });
    var files = ["src/buster.js", "src/stuff.js"];
    nodeGlobStub.withArgs("src/*.js").yields(null, files);

    multiGlob.glob(["lib/buster.js", "src/*.js"], function (err) {
      assert.equals(err, { message: "Oh no" });
      done();
    });
  });

  it("ignore duplicated items from glob", function (done) {
    nodeGlobStub.withArgs("src/foo.js").yields(null, ["src/foo.js"]);
    var files = ["src/foo.js", "src/bar.js"];
    nodeGlobStub.withArgs("src/*.js").yields(null, files);

    multiGlob.glob(["src/foo.js", "src/*.js"], function (err, res) {
      assert.isNull(err);
      assert.equals(res, ["src/foo.js", "src/bar.js"]);
      done();
    });
  });

  it("fails on glob that matches no patterns when strict", function (done) {
    nodeGlobStub.withArgs("src/foo.js").yields(null, []);

    multiGlob.glob(["src/foo.js"], { strict: true }, function (err) {
      assert.match(err, {
        message: "'src/foo.js' matched no files"
      });
      done();
    });
  });
});
