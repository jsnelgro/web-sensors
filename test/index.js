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
    let start = Date.now()
    let bangs = 0
    Sensors.time().subscribe(function(t) {
      if (t -start >= 10) {
        expect(bangs).to.be.within(1, 2)
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

mocha.checkLeaks()
mocha.run()
