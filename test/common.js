
/**
 * Instrument.
 */

var fs = require('fs')
  , path = require('path')

if (process.env.DEBUG) {
  require.extensions['.js'] = function(mod, filename){
    var js = fs.readFileSync(filename, 'utf8');

    // Profiling support
    js = js.replace(/^ *\/\/ *(start|end): *([^\n]+)/gm, function(_, type, expr){
      switch (type) {
        case 'start': return 'console.time(' + expr + ');';
        case 'end': return 'console.timeEnd(' + expr + ');';
      }
    });

    // Debugging
    js = js.replace(/^ *\/\/ *debug: *([^\n,]+) *([^\n]+)?/gm, function(_, fmt, args){
      fmt = fmt.replace(/"/g, '\\"');
      return 'console.error("  client\033[90m ' + fmt + '\033[0m"' + (args || '') + ');';
    });

    js = js.replace(/^ *\/\/ *assert: ([^,]+) *, *([^\n]+)/gm, function(_, expr, msg){
      return 'if (!(' + expr + ')) console.error("  client assert\033[31m %s. (%s)\033[0m", ' + msg + ', "' + expr + '");';
    });

    mod._compile(js, filename);
  };
}

/**
 * Expose `eio` global.
 */

eio = require('../index');

/**
 * Expose client.
 */

eioc = require('engine.io-client');

/**
 * Expose `request` global.
 */

request = require('superagent');

/**
 * Expose `expect` global
 */

expect = require('expect.js');

/**
 * Expose `middler` global
 */

middler = require('middler');

/**
 * Listen shortcut that fires a callback on an epheemal port.
 */

listen = function (opts, fn) {
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  var e = eio.listen(null, opts, function () {
    fn(e.httpServer.address().port);
  });

  // Serve the client html and javascript.
  middler(e.httpServer, function (req, res, next) {
    if (req.url === '/engine.io.js') {
      res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
      fs.createReadStream(path.resolve(__dirname, '../node_modules/engine.io-client/dist/engine.io.js')).pipe(res);
    }
    else if (req.url === '/') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      fs.createReadStream(path.resolve(__dirname, './client.html')).pipe(res);
    }
    else {
      next();
    }
  });

  return e;
}

/**
 * Sprintf util.
 */

require('s').extend();
