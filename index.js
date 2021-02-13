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
let lastData
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
    lastData = new Array(analyser.frequencyBinCount);
    lastData.fill(128)
  })
})

const blue = `rgb(0,0,255)`
const green = `rgb(0,200,0)`
const purple = `rgb(200,0,255)`
const teal = `rgb(0,200,255)`
function draw(delay) {
  i++;
  if(i === 1) {
    audioContext.resume()
  }
  // analyser.getByteFrequencyData(data)
  analyser.getByteTimeDomainData(data)
  let normalData = [...data]
  let smoothData = exponentialSmoothing(0.3, normalData, lastData)
  // let smoothData = twoDimensionalMovingAverage(normalData, lastData)
  context.clearRect(0, 0, canvas.width, canvas.height);
  const dataLength = data.length
  const space = canvas.width / dataLength
  const maxIndex = dataLength - 1
  smoothData.forEach((value, j)=>{
    let color
    let previousIndex = Math.max(j-1, 0)
    let nextIndex = Math.min(j+1, maxIndex)
    if(value < 128) {
      if(delay && lastData[j] < 128 && lastData[previousIndex] < 128 && lastData[nextIndex] < 128) {
        color = blue
      } else {
        color = purple
      }
    } else {
      if(delay && lastData[j] >= 128 && lastData[previousIndex] >= 128 && lastData[nextIndex] >= 128) {
        color = green
      } else {
        color = teal
      }
    }
    context.beginPath();
    context.strokeStyle = color
    context.lineWidth = 1
    context.moveTo(space * j, canvas.height);
    context.lineTo(space * j, canvas.height-value);
    // context.lineTo(space * j, canvas.height-128);
    context.stroke();
  })
  lastData = smoothData
  requestAnimationFrame(() => draw(true))
}

function exponentialSmoothing(alpha, data, previousSmoothData) {
  return data.map((value, i) => {
    return alpha * value + (1 - alpha) * previousSmoothData[i]
  })
}

/* averages data over adjacent data points and across time */
function twoDimensionalMovingAverage(data, previousData) {
  let maxIndex = data.length - 1
  
  return data.map((value, i) => {
    let previousIndex = Math.max(i-1, 0)
    let nextIndex = Math.min(i+1, maxIndex)
    return (previousData[previousIndex] + previousData[i] + previousData[nextIndex] +
            data[previousIndex] + data[i] + data[nextIndex]) / 6
  })
}