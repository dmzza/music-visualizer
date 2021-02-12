let canvas
/** @type CanvasRenderingContext2D */
let context
/** @type AudioElement */
let audioElement
/** @type AudioContext */
let audioContext = 
  // new AudioContext()
  new webkitAudioContext()
/** @type AnalyserNode */
let analyser = audioContext.createAnalyser()
analyser.fftSize = 2048 // max: 2048
/** @type MediaElementAudioSourceNode */
let source
/** @type Uint8Array */
let data
let i = 0

window.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById("visualization")
  context = canvas.getContext("2d")
  audioElement = document.getElementById("source")
  audioElement.addEventListener("play", function () {
    source = audioContext.createMediaElementSource(audioElement)
    source.connect(analyser)
    source.connect(audioContext.destination)
    data = new Uint8Array(analyser.frequencyBinCount);
  })
})

function draw() {
  i++;
  if(i > 100) {
    return;
  }
  analyser.getByteFrequencyData(data)
  let normalData = [...data]
  console.log(normalData)
  context.beginPath()
  context.moveTo(100, 200)
  context.lineTo(200, 200)
  context.lineTo(200, 100)
  context.lineTo(100, 200)
  context.closePath()

  context.stroke()
  context.rotate(-0.1)
  setTimeout(draw, 10)
}