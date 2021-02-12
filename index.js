let canvas
/** @type CanvasRenderingContext2D */
let context
let i = 0

function didLoad() {
  canvas = document.getElementById("visualization")
  context = canvas.getContext("2d")
}

function draw() {
  i++;
  if(i > 1000) {
    return;
  }
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