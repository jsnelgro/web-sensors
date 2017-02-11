'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.touch = exports.mouse = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.time = time;
exports.sight = sight;
exports.sound = sound;
exports.geolocation = geolocation;
exports.resize = resize;
exports.scroll = scroll;
exports.mousedown = mousedown;
exports.mousemove = mousemove;
exports.mouseup = mouseup;
exports.click = click;
exports.dblclick = dblclick;
exports.keydown = keydown;
exports.keypress = keypress;
exports.keyup = keyup;
exports.touchstart = touchstart;
exports.touchmove = touchmove;
exports.touchend = touchend;
exports.random = random;
exports.simplexnoise = simplexnoise;
exports.perlinnoise = perlinnoise;

var _rxLite = require('rx-lite');

var _rxLite2 = _interopRequireDefault(_rxLite);

var _rxDom = require('rx-dom');

var _rxDom2 = _interopRequireDefault(_rxDom);

var _getusermedia = require('getusermedia');

var _getusermedia2 = _interopRequireDefault(_getusermedia);

var _requestanimationframe = require('requestanimationframe');

var _requestanimationframe2 = _interopRequireDefault(_requestanimationframe);

var _noisejs = require('noisejs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioContext = window.AudioContext || window.webkitAudioContext;

var DataGenerator = function () {
  function DataGenerator() {
    var _this = this;

    var framerate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var cb = arguments[1];

    _classCallCheck(this, DataGenerator);

    if (typeof cb !== 'function') {
      console.error('generator requires a callback');
      return;
    }
    this.framerate = framerate;
    this.interval = null;
    var wrapperFn = function wrapperFn() {
      cb();
      if (_this.framerate === 0) {
        (0, _requestanimationframe2.default)(wrapperFn);
      } else {
        setTimeout(function () {
          (0, _requestanimationframe2.default)(wrapperFn);
        }, 1 / framerate * 1000);
      }
    };
    this.interval = (0, _requestanimationframe2.default)(wrapperFn);
  }

  _createClass(DataGenerator, [{
    key: 'stop',
    value: function stop() {
      cancelAnimationFrame(this.interval);
    }
  }]);

  return DataGenerator;
}();

var noiseArrHelper = function noiseArrHelper() {
  var shape = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [1, 0, 0];
  var fn2d = arguments[1];
  var fn3d = arguments[2];

  return [].concat(_toConsumableArray(Array(shape[0]).keys())).map(function (x) {
    x += Date.now() / 1000;
    if (shape[1] > 0) {
      return [].concat(_toConsumableArray(Array(shape[1]).keys())).map(function (y) {
        y += Date.now() / 1000;
        if (shape[2] > 0) {
          return [].concat(_toConsumableArray(Array(shape[2]).keys())).map(function (z) {
            z += Date.now() / 1000;
            return fn3d(x, y, z);
          });
        } else {
          return fn2d(x, y);
        }
      });
    } else {
      return fn2d(x, 0);
    }
  });
};

/**
 * observe the passing of time...
 * @param {number} [framerate=0] optional framerate.
 * defaults to 0, which uses requestAnimationFrame
 * @returns {Observable} stream of the current UTC time in ms
 */
function time() {
  var framerate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return _rxLite2.default.Observable.create(function (observer) {
    if (framerate === 0) {
      (function () {
        var getTime = function getTime() {
          observer.onNext(Date.now());
          if (framerate === 0) {
            (0, _requestanimationframe2.default)(getTime);
          }
        };
        (0, _requestanimationframe2.default)(getTime);
      })();
    } else {
      setInterval(function () {
        observer.onNext(Date.now());
      }, 1 / framerate * 1000);
    }
  });
}

/**
 * a wrapper to make getting a webcam feed much easier than the standard getUserMedia API
 * @param {number} [$0.framerate=0] optional framerate.
 * defaults to 0, which uses requestAnimationFrame
 * @param {number} [$0.width=320] optional width for the returned frame (height is calculated).
 * @returns {Observable} pixel array stream
 */
function sight(_ref) {
  var _ref$framerate = _ref.framerate,
      framerate = _ref$framerate === undefined ? 0 : _ref$framerate,
      _ref$width = _ref.width,
      width = _ref$width === undefined ? 320 : _ref$width;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var video = document.createElement('video');
  var streaming = false;
  var height = 0;
  video.addEventListener('canplay', function (ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);
  return _rxLite2.default.Observable.create(function (observer) {
    (0, _getusermedia2.default)({ audio: false, video: true }, function (err, stream) {
      if (err) {
        observer.onError(err);return;
      }
      var updateSight = function updateSight() {
        if (!streaming) {
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        var frame = ctx.getImageData(0, 0, width, height);
        observer.onNext(frame);
        if (framerate === 0) {
          (0, _requestanimationframe2.default)(updateSight);
        }
      };
      video.srcObject = stream;
      video.play();
      if (framerate === 0) {
        (0, _requestanimationframe2.default)(updateSight);
      } else {
        setInterval(function () {
          updateSight();
        }, 1 / framerate * 1000);
      }
    });
  }).publish().refCount();
}

/**
 * a wrapper to make getting a microphone feed much easier than the standard getUserMedia API
 * @param {number} [$0.framerate=0] optional framerate.
 * defaults to 0, which uses requestAnimationFrame
 * @param {number} [$0.fftSize=2048] optional fft resolution.
 * @returns {Observable} Uint8Array stream
 */
function sound(_ref2) {
  var _ref2$framerate = _ref2.framerate,
      framerate = _ref2$framerate === undefined ? 0 : _ref2$framerate,
      _ref2$fftSize = _ref2.fftSize,
      fftSize = _ref2$fftSize === undefined ? 2048 : _ref2$fftSize;

  var audioCtx = new AudioContext();
  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = fftSize;
  var freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(freqData);
  return _rxLite2.default.Observable.create(function (observer) {
    (0, _getusermedia2.default)({ audio: true, video: false }, function (err, stream) {
      if (err) {
        observer.onError(err);return;
      }
      var updateSound = function updateSound() {
        analyser.getByteTimeDomainData(freqData);
        observer.onNext(freqData);
        if (framerate === 0) {
          (0, _requestanimationframe2.default)(updateSound);
        }
      };
      var source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      if (framerate === 0) {
        (0, _requestanimationframe2.default)(updateSound);
      } else {
        setInterval(function () {
          updateSound();
        }, 1 / framerate * 1000);
      }
    });
  }).publish().refCount();
}

/**
 * watch the user's current GPS coordinates
 * @returns {Observable} {lat, lng} stream
 */
function geolocation() {
  return _rxDom2.default.DOM.geolocation.watchPosition();
}

/**
 * watch for changes in the user's browser window size
 * @param {number} [throttleRate=100] optional interval to throttle this stream by.
 * @returns {Observable} {width, height}
 */
function resize() {
  var throttleRate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

  return _rxDom2.default.DOM.resize(document).throttle(throttleRate).map(function (_ref3) {
    var target = _ref3.target;

    return {
      width: target.innerWidth,
      height: target.innerHeight
    };
  });
}

/**
 * @param {number} [throttleRate=2] optional interval to throttle this stream by.
 * @returns {Observable} {scroll event}
 */
function scroll() {
  var throttleRate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

  return _rxDom2.default.DOM.scroll(document).throttle(throttleRate);
}

/**
 * @returns {Observable} document mousedown event
 */
function mousedown() {
  return _rxDom2.default.DOM.mousedown(document);
}

/**
 * @returns {Observable} mousemove event
 */
function mousemove() {
  return _rxDom2.default.DOM.mousemove(document);
}

/**
 * a simple version of mousemove that only returns the clientX and clientY location
 * @returns {Observable} {x, y} of the mouse position
 */
var mouse = exports.mouse = mousemove.map(function (ev) {
  return { x: ev.clientX, y: ev.clientY };
});

/**
 * @returns {Observable} document mouseup event
 */
function mouseup() {
  return _rxDom2.default.DOM.mouseup(document);
}

/**
 * @returns {Observable} document click event
 */
function click() {
  return _rxDom2.default.DOM.click(document);
}

/**
 * @returns {Observable} document double click event
 */
function dblclick() {
  return _rxDom2.default.DOM.dblclick(document);
}

/**
 * @returns {Observable} document keydown event
 */
function keydown() {
  return _rxDom2.default.DOM.keydown(document);
}

/**
 * @returns {Observable} document keypress event
 */
function keypress() {
  return _rxDom2.default.DOM.keypress(document);
}

/**
 * @returns {Observable} document keyup event
 */
function keyup() {
  return _rxDom2.default.DOM.keyup(document);
}

/**
 * @returns {Observable} document touchstart event
 */
function touchstart() {
  return _rxDom2.default.DOM.touchstart(document);
}

/**
 * @returns {Observable} document touchmove event
 */
function touchmove() {
  return _rxDom2.default.DOM.touchmove(document);
}

/**
 * @returns {Observable} document touchmove event
 */
var touch = exports.touch = touchmove;

/**
 * @returns {Observable} document touchend event
 */
function touchend() {
  return _rxDom2.default.DOM.touchend(document);
}

/**
  * generates a stream of random numbers
  *
  * @param {number} [$0.seed=Math.random()] optional seed for the generator.
  * @param {array} [$0.shape=[1, 0, 0]] the dimensionality of the returned value
  * shape[0] corresponds to the length of the x axis, shape[1] corresponds to the length of the y axis,
  * shape[2] corresponds to the length of the z axis. Shape array can be any length between 1 and 3,
  * so [5, 5], for example, would return a 5x5 array of random values between 0 and 1
  * @param {number} [$0.framerate=0] optional framerate.
  * defaults to 0, which uses requestAnimationFrame
  * @returns {Observable} stream of random numbers or an array of random numbers
 */
function random(_ref4) {
  var _ref4$seed = _ref4.seed,
      seed = _ref4$seed === undefined ? null : _ref4$seed,
      _ref4$shape = _ref4.shape,
      shape = _ref4$shape === undefined ? [1, 0, 0] : _ref4$shape,
      _ref4$framerate = _ref4.framerate,
      framerate = _ref4$framerate === undefined ? 0 : _ref4$framerate;

  if (!seed) {
    seed = Math.random();
  }
  return _rxLite2.default.Observable.create(function (observer) {
    var gen = new DataGenerator(framerate, function () {
      var noise = noiseArrHelper(shape, Math.random, Math.random);
      observer.onNext(noise);
    });
    return function () {
      gen.stop();
    };
  });
}

/**
  * generates a stream of values using simplex noise
  * @param {number} [$0.seed=Math.random()] optional seed for the generator.
  * @param {array} [$0.shape=[1, 0, 0]] the dimensionality of the returned value
  * shape[0] corresponds to the length of the x axis, shape[1] corresponds to the length of the y axis,
  * shape[2] corresponds to the length of the z axis. Shape array can be any length between 1 and 3,
  * so [5, 5], for example, would return a 5x5 array of simplex noise values
  * @param {number} [$0.framerate=0] optional framerate.
  * defaults to 0, which uses requestAnimationFrame
  * @returns {Observable} stream of simplex values
 */
function simplexnoise(_ref5) {
  var _ref5$seed = _ref5.seed,
      seed = _ref5$seed === undefined ? null : _ref5$seed,
      _ref5$shape = _ref5.shape,
      shape = _ref5$shape === undefined ? [1, 0, 0] : _ref5$shape,
      _ref5$framerate = _ref5.framerate,
      framerate = _ref5$framerate === undefined ? 0 : _ref5$framerate;

  if (!seed) {
    seed = Math.random();
  }
  return _rxLite2.default.Observable.create(function (observer) {
    var noiseGen = new _noisejs.Noise(seed);
    var gen = new DataGenerator(framerate, function () {
      var noise = noiseArrHelper(shape, function (x, y) {
        return noiseGen.simplex2(x, y);
      }, function (x, y, z) {
        return noiseGen.simplex3(x, y, z);
      });
      observer.onNext(noise);
    });
    return function () {
      gen.stop();
    };
  });
}

/**
  * generates a stream of values using perlin noise
  * @param {number} [$0.$0.seed=Math.random()] optional seed for the generator.
  * @param {array} [$0.$0.shape=[1, 0, 0]] the dimensionality of the returned value
  * shape[0] corresponds to the length of the x axis, shape[1] corresponds to the length of the y axis,
  * shape[2] corresponds to the length of the z axis. Shape array can be any length between 1 and 3,
  * so [5, 5], for example, would return a 5x5 array of perlin noise values
  * @param {number} [$0.$0.framerate=0] optional framerate.
  * defaults to 0, which uses requestAnimationFrame
  * @returns {Observable} stream of perlin values
 */
function perlinnoise(_ref6) {
  var _ref6$seed = _ref6.seed,
      seed = _ref6$seed === undefined ? null : _ref6$seed,
      _ref6$shape = _ref6.shape,
      shape = _ref6$shape === undefined ? [1, 0, 0] : _ref6$shape,
      _ref6$framerate = _ref6.framerate,
      framerate = _ref6$framerate === undefined ? 0 : _ref6$framerate;

  if (!seed) {
    seed = Math.random();
  }
  return _rxLite2.default.Observable.create(function (observer) {
    var noiseGen = new _noisejs.Noise(seed);
    var gen = new DataGenerator(framerate, function () {
      var noise = noiseArrHelper(shape, function (x, y) {
        return noiseGen.perlin2(x, y);
      }, function (x, y, z) {
        return noiseGen.perlin3(x, y, z);
      });
      observer.onNext(noise);
    });
    return function () {
      gen.stop();
    };
  });
}

exports.default = {
  time: time, sight: sight, sound: sound,
  geolocation: geolocation, resize: resize, scroll: scroll,
  mousedown: mousedown, mouse: mouse, mousemove: mousemove, mouseup: mouseup, click: click, dblclick: dblclick,
  keydown: keydown, keypress: keypress, keyup: keyup,
  touchstart: touchstart, touchmove: touchmove, touchend: touchend,
  random: random, simplexnoise: simplexnoise, perlinnoise: perlinnoise
};