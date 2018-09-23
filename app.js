const ctx        = window.canvas.getContext('2d')
const inputs     = document.querySelectorAll('input')
const shuffleBtn = document.querySelector('button[name="shuffle"')

let columns = parseInt( inputs[0].value )
let rows    = parseInt( inputs[1].value )
let pieces, selected

const img = new Image()

img.src = 'puzzle-image_01.jpg'

function generatePieces() {
  const width  = Math.floor( canvas.width  / columns )
  const height = Math.floor( canvas.height / rows )

  pieces = []

  for ( let y = 0; y < rows; y++ ) {
    for ( let x = 0; x < columns; x++ ) {
      const piece = {
        width,
        height,
        currentPosition:  {x: x * width, y: y * height},
        originalPosition: {x: x * width, y: y * height},
        locked: true,
        sides: {
          top:    y == 0           ? 0 : undefined,
          right:  x == columns - 1 ? 0 : undefined,
          bottom: y == rows - 1    ? 0 : undefined,
          left:   x == 0           ? 0 : undefined
        }
      }

      pieces.push(piece)
    }
  }

  for ( let y = 0; y < rows; y++ ) {
    for ( let x = 0; x < columns; x++ ) {
      const piece       = pieces[ y * columns + x ]
      const pieceRight  = pieces[ x < columns - 1  ? y * columns + (x + 1) : undefined ]
      const pieceBottom = pieces[ y < rows - 1     ? (y + 1) * columns + x : undefined ]

      if (piece.sides.right  == undefined) piece.sides.right  = Math.floor( Math.random() * 2 ) ? 1 : -1
      if (piece.sides.bottom == undefined) piece.sides.bottom = Math.floor( Math.random() * 2 ) ? 1 : -1

      if (pieceRight)  pieceRight.sides.left = -piece.sides.right
      if (pieceBottom) pieceBottom.sides.top = -piece.sides.bottom
    }
  }

}

function shufflePieces() {
  pieces.forEach( piece => {
    piece.currentPosition.x = Math.floor( Math.random() * ( canvas.width  - piece.width  ) )
    piece.currentPosition.y = Math.floor( Math.random() * ( canvas.height - piece.height ) )
    piece.locked = false
  } )
}

function drawPiece(piece, i) {
  const { width, height } = piece
  const { x, y } = piece.currentPosition
  const { top, right, bottom, left } = piece.sides

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

  const column  = Math.floor( i % columns )
  const row     = Math.floor( i / columns )

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

  pieces.forEach((piece, i) => drawPiece(piece, i) )

  if (selected >= 0) drawPiece( pieces[selected], selected )

  requestAnimationFrame(draw)
}

function checkPieces() {
  pieces.forEach(piece => {
    if (
      piece.currentPosition.x > piece.originalPosition.x - piece.width  * .2 &&
      piece.currentPosition.x < piece.originalPosition.x + piece.width  * .2 &&
      piece.currentPosition.y > piece.originalPosition.y - piece.height * .2 &&
      piece.currentPosition.y < piece.originalPosition.y + piece.height * .2
    ) {
      piece.currentPosition.x = piece.originalPosition.x
      piece.currentPosition.y = piece.originalPosition.y
      piece.locked = true
    }
  })
}

generatePieces()
img.onload = () => requestAnimationFrame(draw)

inputs.forEach(input => {
  input.addEventListener('change', e => {
    if (e.target.name == 'columns') columns = parseInt(e.target.value)
    if (e.target.name == 'rows')       rows = parseInt(e.target.value)
    generatePieces()
  })
})

shuffleBtn.addEventListener('click', e => {
  shufflePieces()
})

canvas.addEventListener('mousedown', e => {
  for (let i = pieces.length - 1; i > 0; i--) {
    if (
      !pieces[i].locked &&
      e.layerX >= pieces[i].currentPosition.x && 
      e.layerX <= pieces[i].currentPosition.x + pieces[i].width && 
      e.layerY >= pieces[i].currentPosition.y && 
      e.layerY <= pieces[i].currentPosition.y + pieces[i].height
    ) {
      selected = i
      break
    }
  }
})

canvas.addEventListener('mouseup',  e => {
  selected = undefined
  checkPieces()
})

canvas.addEventListener('mouseout', e => {
  selected = undefined
})

canvas.addEventListener('mousemove', e => {

  if (selected >= 0) {
    pieces[selected].currentPosition.x = e.layerX - pieces[selected].width  / 2
    pieces[selected].currentPosition.y = e.layerY - pieces[selected].height / 2
  }

} )