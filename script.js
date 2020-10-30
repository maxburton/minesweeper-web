function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

class Game {
  constructor(numMines=20, size=10) {
    this.state = {
      numMines: numMines,
      size: size,
      allCoords: [],
      allCoordsMapped: [],
      mineCoords: [],
      mineCoordsString: [],
      isDead: false,
      isWinner: false,
      spacesRevealed: 0,
      flags: 0,
    }
  }

  generate = () => {
    const gameBoard = document.getElementById("gameboard")
    for(let i=0; i < this.state.size; i++){
      const row = document.createElement("DIV")
      row.className = "row"
      gameBoard.appendChild(row)

      for(let j=0; j < this.state.size; j++){
        const col = document.createElement("DIV")
        col.className = "col"
        row.appendChild(col)

        const space = document.createElement("DIV")
        space.className = "square text-center"
        const coord = {x: j, y: i}
        this.state.allCoords.push(coord)
        space.setAttribute("id", `${this.coordToString(coord)}`)
        space.setAttribute("onclick", `game.handleClick({x: ${coord.x}, y: ${coord.y}})`)
        space.setAttribute("oncontextmenu", `game.placeFlag({x: ${coord.x}, y: ${coord.y}});return false;`)
        col.appendChild(space)
        
      }
    }
    // add mines
    let shuffledCoords = this.state.allCoords.slice()
    shuffleArray(shuffledCoords)
    this.state.mineCoords = shuffledCoords.slice(0, this.state.numMines)
    this.state.mineCoordsString = this.state.mineCoords.map(this.coordToString)
    console.log(`Mine coordinates: ${this.state.mineCoordsString}`)

    // calc numbers
    for(let i=0; i < this.state.size; i++){
      for(let j=0; j < this.state.size; j++){
        const coord = {x: j, y: i}
        const coordString = this.coordToString(coord)
        if (this.checkIfBomb(coord)){
          this.state.allCoordsMapped[coordString] = -1
        } else {
          this.state.allCoordsMapped[coordString] = this.countSurroundingBombs(coord)
        }
      }
    }
  }

  updateScore = () => {
    this.state.spacesRevealed++
    const score = document.getElementById("score")
    score.innerText = `Score: ${this.state.spacesRevealed}`

    // check if all non bomb spaces are revealed
    if ((this.state.size * this.state.size) - this.state.spacesRevealed <= this.state.numMines){
      this.state.isWinner = true
      score.innerText = score.innerText + " (YOU WIN!)"
      const wins = document.getElementById("wins")
      wins.innerText = wins.innerText + "👑"
      this.revealMap()
    }
  }

  checkIfBomb = (coord) => {
    return this.state.mineCoordsString.includes(this.coordToString(coord))
  }

  countSurroundingBombs = (coord) => {
    let bombCount = 0
    for(let i=-1; i<=1; i++){
      let x = coord.x + i
      if(x < 0 || x >= this.state.size){
        continue
      }
      for(let j=-1; j<=1; j++){
        let y = coord.y + j
        if(y < 0 || y >= this.state.size){
          continue
        }
        if(this.checkIfBomb({x: x, y: y})){
          bombCount++
        }
      }
    }
    return bombCount
  }

  placeFlag = (coord) => {
    if(!this.state.isDead && !this.state.isWinner){
      const space = document.getElementById(this.coordToString(coord))
      const flags = document.getElementById("flags")
      if (space.innerText == "🚩"){
        space.innerText = ""
        this.state.flags--
        flags.innerText = `Flags: ${this.state.flags}`
      }else if (!space.innerText){
        space.innerText = "🚩"
        this.state.flags++
        flags.innerText = `Flags: ${this.state.flags}`
      }
    }
  }

  handleClick = (coord) => {
    if(!this.state.isDead && !this.state.isWinner){
      const space = document.getElementById(this.coordToString(coord))
      const value = this.state.allCoordsMapped[this.coordToString(coord)]
      if(value == -1){
        console.log("Game over!")
        space.innerText = "💥"
        this.revealMap()
        this.state.isDead = true
      }else if(value != 0){
        space.innerText = value
        this.updateScore()
      }else{
        this.calcNum(coord)
      }
      console.log(`Coord clicked: ${this.coordToString(coord)}`)
    }
  }

  calcNum = (coord) => {
      const recurse = []
      for(let i=-1; i<=1; i++){
        let x = coord.x + i
        if(x < 0 || x >= this.state.size){
          continue
        }
        for(let j=-1; j<=1; j++){
          let y = coord.y + j
          if(y < 0 || y >= this.state.size){
            continue
          }
          const newCoord = {x: x, y: y}
          const newCoordString = this.coordToString(newCoord)
          // skip if value already revealed
          if(!document.getElementById(newCoordString).innerText){
            const value = this.state.allCoordsMapped[newCoordString]
            if(value == 0){
              recurse.push(newCoord)
            }
            // reveal zeroes
            const space = document.getElementById(newCoordString)
            space.innerText = value
            this.updateScore()
          }
        }
      }
      for (let coord of recurse){
        this.calcNum(coord)
      }
  }

  revealMap = () => {
    console.log("Revealing Map")

    for(let key in this.state.allCoordsMapped){
      const space = document.getElementById(key);
      const value = this.state.allCoordsMapped[key]
      if(value == -1){
        if(space.innerHTML != "💥" && space.innerHTML != "🚩"){
          space.innerHTML = "💣"
        }
      } else{
        space.innerHTML = value
      }
    }
  }

  coordToString = (coord) => {
    return `${coord.x}-${coord.y}`
  }
}

let game = null
document.getElementById("generate").addEventListener("click", function() {
  // clear any previous game:
  const gameBoard = document.getElementById("gameboard");
  gameBoard.innerHTML = '';

  const score = document.getElementById("score");
  score.innerHTML = 'Score: 0'

  // generate new game
  game = new Game(document.getElementById("numMines").value, document.getElementById("size").value)
  game.generate()
});
