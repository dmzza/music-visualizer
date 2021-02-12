let canvas
/** @type CanvasRenderingContext2D */
let context
/** @type AudioElement */
let audioElement
function constructAudioContext() {
  if(typeof(AudioContext) == "undefined") {
    return new webkitAudioContext()
  } else {
    return new AudioContext()
  }
}
/** @type AudioContext */
let audioContext = constructAudioContext()
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
  if(i === 1) {
    audioContext.resume()
  }
  analyser.getByteFrequencyData(data)
  let normalData = [...data]
  context.clearRect(0, 0, canvas.width, canvas.height);
  let space = canvas.width / data.length;
  normalData.forEach((value, j)=>{
    context.beginPath();
    context.moveTo(space * j, canvas.height);
    context.lineTo(space * j, canvas.height-value);
    context.stroke();
  })
  requestAnimationFrame(draw)
}