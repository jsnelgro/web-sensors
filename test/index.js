import '../node_modules/mocha/mocha.js'
import Sensors from '../src/index.js'
import expect from 'expect.js'
mocha.setup('bdd')

const framerate_tests = [
  {args: 40, expected: 40},
  {args: 33, expected: 33},
  {args: 30, expected: 30},
  {args: 25, expected: 25},
  {args: 20, expected: 20},
  {args: 15, expected: 15},
  {args: 10, expected: 10},
  {args: 5, expected: 5}
]

describe('time', function () {
  it('creates a stream of timestamps', function(done) {
    let bangs = 0
    Sensors.time().subscribe(function (t) {
      expect(t).to.be.a('number')
      bangs++
      if (bangs >= 10) {
        done()
        this.dispose()
      }
    })
  })

  it('defaults to 60 fps if no framerate option is given', function(done) {
    this.retries(2)
    let start = Date.now()
    let bangs = 0
    Sensors.time().subscribe(function(t) {
      if (t - start >= 500) {
        expect(bangs).to.be.within(30, 31)
        done()
        this.dispose()
      }
      bangs++
    })
  })

  framerate_tests.forEach(function(test) {
    it(`can run at ${test.args}fps`, function(done) {
      let test_shortener = 4
      let start = Date.now()
      let bangs = 0
      Sensors.time(test.args).subscribe(function(t) {
        bangs++
        if (t -start >= 1000 / test_shortener) {
          test.expected = test.expected / test_shortener
          expect(bangs).to.be.within(test.expected - 2, test.expected + 2)
          done()
          this.dispose()
        }
      })
    })
  })
})

describe('sight', function () {
  it('creates a stream of ImageData', function (done) {
    Sensors.sight().subscribe(function(imgData) {
      expect(imgData).to.be.an('object')
      done()
      this.dispose()
    })
  })
})

describe('sound', function () {
  it('creates a stream of audio data', function (done) {
    Sensors.sound().subscribe(function(audio) {
      expect(audio).to.be.ok()
      done()
      this.dispose()
    })
  })

  it('lets you set the fft size', function (done) {
    Sensors.sound({fftSize: 32}).subscribe(function(audio) {
      expect(audio.length).to.be(16)
      done()
      this.dispose()
    })
  })
})

describe('geolocation', function() {
  it.skip('returns a stream of the users lat lng coords', function (done) {
    this.timeout(6000)
    Sensors.geolocation().subscribe(function({coords}) {
      expect(coords.latitude).to.be.within(-180, 180)
      expect(coords.longitude).to.be.within(-180, 180)
      done()
      this.dispose()
    })
  })
})


describe('resize', function() {
  it.skip('fires on resize', function(done) {
    Sensors.resize().subscribe(function () {
      done()
      this.dispose()
    })
    window.dispatchEvent(new Event('resize'))
  })
})

describe('scroll', function() {
  it('fires on scroll', function(done) {
    Sensors.scroll().subscribe(function () {
      done()
      this.dispose()
    })
    window.scroll(0, 0)
    window.scroll(100, 100)
  })
})

describe('mousedown', function () {})

describe('mousemove', function () {})

describe('mouse', function () {})

describe('mouseup', function () {})

describe('click', function () {})

describe('dblclick', function () {})

describe('keydown', function () {})

describe('keypress', function () {})

describe('keyup', function () {})

describe('touchstart', function () {})

describe('touchmove', function () {})

describe('touch', function () {})

describe('touchend', function () {})

describe('random', function () {})

describe('simplexnoise', function () {})

describe('perlinnoise', function () {})

describe('midi', function () {})

mocha.checkLeaks()
mocha.run()
