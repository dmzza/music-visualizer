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
let isFiltered = false
/** @type IIRFilterNode */
let iirfilter
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

    // Taken from: https://codepen.io/Rumyra/pen/oPxvYB/
    // change this to change the filter - can be 0-3 and will reference the values in the array below
    const filterNumber = 0

    let lowPassCoefs = [
      {
        frequency: 200,
        feedforward: [0.00020298, 0.0004059599, 0.00020298],
        feedback: [1.0126964558, -1.9991880801, 0.9873035442]
      },
      {
        frequency: 500,
        feedforward: [0.0012681742, 0.0025363483, 0.0012681742],
        feedback: [1.0317185917, -1.9949273033, 0.9682814083]
      },
      {
        frequency: 1000,
        feedforward: [0.0050662636, 0.0101325272, 0.0050662636],
        feedback: [1.0632762845, -1.9797349456, 0.9367237155]
      },
      {
        frequency: 5000,
        feedforward: [0.1215955842, 0.2431911684, 0.1215955842],
        feedback: [1.2912769759, -1.5136176632, 0.7087230241]
      }
    ]

    let feedForward = lowPassCoefs[filterNumber].feedforward,
      feedBack = lowPassCoefs[filterNumber].feedback
    iirfilter = audioContext.createIIRFilter(feedForward, feedBack)

    data = new Uint8Array(analyser.frequencyBinCount);
    lastData = new Array(analyser.frequencyBinCount);
    lastData.fill(128)
  })
})

const blue = `rgb(0,0,255)`
const green = `rgb(0,200,0)`
const purple = `rgb(200,0,255)`
const teal = `rgb(0,200,255)`
const red = `rgb(255,0,0)`
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
  let [startingPoint, endingPoint] = identifyLongCrest(smoothData)
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
    if(j >= startingPoint && j <= endingPoint) {
      color = red
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

function identifyLongCrest(data) {
  let startingPoint = 0
  let endingPoint = 0
  let i = 0
  let dataLength = data.length
  while(endingPoint === 0 && i < dataLength) {
    if(data[i] > 128) {
      if(startingPoint === 0) {
        startingPoint = i
      }
    } else {
      if(startingPoint !== 0) {
        if(i - startingPoint > 200) {
          endingPoint = i
        } else {
          startingPoint = 0
        }
      }
    }
    i++
  }
  return [startingPoint, endingPoint]
}

function toggleFilter() {
  if(isFiltered) {
    source.disconnect(iirfilter)
    source.connect(analyser)
    isFiltered = false
  } else {
    source.disconnect(analyser)
    source.connect(iirfilter).connect(analyser)
    isFiltered = true
  }
}