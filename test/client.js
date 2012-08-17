
/**
 * Test dependencies.
 */

var Browser = require('zombie');

/**
 * Tests.
 */

describe('client', function () {
  describe('polling', function () {
    it('should poll for a bit without closing', function (done) {
      var engine = listen({transports: ['polling'], allowUpgrades: false}, function (port) {
        var b = new Browser();
        b
          .visit('http://localhost:%d/'.s(port), function () {
            setTimeout(function() {
              expect(b.text('body')).to.be('socket connected');
              done();
            }, 10000);
          });
      });
    });
  });
});
