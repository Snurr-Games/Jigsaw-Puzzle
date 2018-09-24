const ctx        = window.canvas.getContext('2d')
const inputs     = document.querySelectorAll('input')
const shuffleBtn = document.querySelector('button[name="shuffle"')

let columns = parseInt( inputs[0].value )
let rows    = parseInt( inputs[1].value )
let pieces
let isSelected = false

const img = new Image()

img.src = 'assets/images/puzzle-image_01.jpg'

function generatePieces() {
  const width  = Math.floor( canvas.width  / columns )
  const height = Math.floor( canvas.height / rows )

  pieces = []

  for ( let y = 0; y < rows; y++ ) {
    for ( let x = 0; x < columns; x++ ) {
      const piece = {
        originalIndex: y * columns + x,
        width,
        height,
        currentPosition:  [x * width, y * height],
        originalPosition: [x * width, y * height],
        isLocked: true,
        sides: [
          y == 0           ? 0 : undefined,
          x == columns - 1 ? 0 : undefined,
          y == rows - 1    ? 0 : undefined,
          x == 0           ? 0 : undefined
        ]
      }

      pieces.push(piece)
    }
  }

  for ( let y = 0; y < rows; y++ ) {
    for ( let x = 0; x < columns; x++ ) {
      const piece       = pieces[ y * columns + x ]
      const pieceRight  = pieces[ x < columns - 1  ? y * columns + (x + 1) : undefined ]
      const pieceBottom = pieces[ y < rows - 1     ? (y + 1) * columns + x : undefined ]

      if (piece.sides[1] == undefined) piece.sides[1] = Math.floor( Math.random() * 2 ) ? 1 : -1
      if (piece.sides[2] == undefined) piece.sides[2] = Math.floor( Math.random() * 2 ) ? 1 : -1

      if (pieceRight)  pieceRight.sides[3]  = -piece.sides[1]
      if (pieceBottom) pieceBottom.sides[0] = -piece.sides[2]
    }
  }

}

function shufflePieces() {
  pieces.forEach( piece => {
    piece.currentPosition[0] = Math.floor( Math.random() * ( canvas.width  - piece.width  ) )
    piece.currentPosition[1] = Math.floor( Math.random() * ( canvas.height - piece.height ) )
    piece.isLocked = false
  } )
}

function drawPiece(piece) {
  const { width, height } = piece
  const [ x, y ] = piece.currentPosition
  const [ top, right, bottom, left ] = piece.sides

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x, y)
  
  if ( top !== 0 ) {
    ctx.lineTo(x + width * .4, y)

    ctx.bezierCurveTo(
      x + width * .4, (top === 1 ? y - height * .2 : y + height * .2),
      x + width * .6, (top === 1 ? y - height * .2 : y + height * .2),
      x + width * .6, y
    )
  }
  ctx.lineTo(x + width, y)

  if ( right !== 0 ) {
    ctx.lineTo(x + width, y + height * .4)

    ctx.bezierCurveTo(
      x + width * (right === 1 ? 1.2 : .8), y + height * .4,
      x + width * (right === 1 ? 1.2 : .8), y + height * .6,
      x + width,                            y + height * .6
    )
  }
  ctx.lineTo(x + width, y + height)

  if ( bottom !== 0 ) {
    ctx.lineTo(x + width * .6, y + height)

    ctx.bezierCurveTo(
      x + width * .6, y + height * (bottom === 1 ? 1.2 : .8),
      x + width * .4, y + height * (bottom === 1 ? 1.2 : .8),
      x + width * .4, y + height
    )
  }
  ctx.lineTo(x, y + height)

  if ( left !== 0 ) {
    ctx.lineTo(x, y + height * .6)

    ctx.bezierCurveTo(
      left === 1 ? x - width * .2 : x + width * .2, y + height * .6,
      left === 1 ? x - width * .2 : x + width * .2, y + height * .4,
      x, y + height * .4
    )
  }
  ctx.lineTo(x, y)
  ctx.closePath()
  ctx.fill()
  ctx.clip()

  const column  = Math.floor( piece.originalIndex % columns )
  const row     = Math.floor( piece.originalIndex / columns )

  const sWidth  = Math.floor( img.width  / columns )
  const sHeight = Math.floor( img.height / rows    )

  const sX = column * ( sWidth  * .8 )
  const sY = row    * ( sHeight * .8 )

  const dWidth  = width  * 1.4
  const dHeight = height * 1.4

  const dX = x - dWidth  * .2
  const dY = y - dHeight * .2

  ctx.drawImage( img, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight )

  ctx.lineWidth = 1
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()
  ctx.restore()
}

function draw() {
  canvas.width = canvas.width

  pieces.filter( piece =>  piece.isLocked).forEach(piece => drawPiece(piece) )
  pieces.filter( piece => !piece.isLocked).forEach(piece => drawPiece(piece) )

  requestAnimationFrame(draw)
}

function checkPieces() {
  pieces.forEach(piece => {
    if (
      piece.currentPosition[0] > piece.originalPosition[0] - piece.width  * .2 &&
      piece.currentPosition[0] < piece.originalPosition[0] + piece.width  * .2 &&
      piece.currentPosition[1] > piece.originalPosition[1] - piece.height * .2 &&
      piece.currentPosition[1] < piece.originalPosition[1] + piece.height * .2
    ) {
      piece.currentPosition[0] = piece.originalPosition[0]
      piece.currentPosition[1] = piece.originalPosition[1]
      piece.isLocked = true
    }
  })
}

generatePieces()
img.onload = () => requestAnimationFrame(draw)

inputs.forEach(input => {
  input.addEventListener('change', e => {
    let value = parseInt(e.target.value)
    const max = parseInt(e.target.max)
    const min = parseInt(e.target.min)

    if (value > max) value = max
    if (value < min) value = min

    if (e.target.name == 'columns') columns = value  
    if (e.target.name == 'rows')    rows    = value

    generatePieces()
  })
})

shuffleBtn.addEventListener('click', e => {
  shufflePieces()
})

canvas.addEventListener('mousedown', e => {
  for (let i = pieces.length - 1; i >= 0; i--) {
    if (
      !pieces[i].isLocked &&
      e.layerX >= pieces[i].currentPosition[0] && 
      e.layerX <= pieces[i].currentPosition[0] + pieces[i].width && 
      e.layerY >= pieces[i].currentPosition[1] && 
      e.layerY <= pieces[i].currentPosition[1] + pieces[i].height
    ) {
      isSelected = true
      pieces.push( pieces.splice(i, 1)[0] )
      break
    }
  }
})

canvas.addEventListener('mouseup',  e => {
  isSelected = false
  checkPieces()
})

canvas.addEventListener('mouseout', e => {
  isSelected = false
})

canvas.addEventListener('mousemove', e => {
  if (isSelected) {
    const piece = pieces[pieces.length -1]
    piece.currentPosition[0] = e.layerX - piece.width  / 2
    piece.currentPosition[1] = e.layerY - piece.height / 2
  }
})