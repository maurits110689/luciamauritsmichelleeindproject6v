let CELL = 16 //cell size defaults to 16
let anchor = 0 //anchor for top left of game board (used later)
let debug = false //show debug stuffs
let input = [] //list of keys pressed
let directions = { //controls
	"d":0,
	"w":1,
	"a":2,
	"s":3
}
let arrowDirections = { //controls
	"ArrowRight":0,
	"ArrowUp":1,
	"ArrowLeft":2,
	"ArrowDown":3
}
let profileStart //to be set to Date.now() for profiling functions
let directionVectors = [] //direction vectors (used in setup function)
let ticks = 0 //game ticks passed
let gameSpeed = 0.1 //speed at which the game runs (not framerate)
let dotWave = true //wavey dots can cause lag so its disabled by default
let lives = 3 //pacmans lives
let p //the player variable
let stopped = true //is the game stopped?
let paused = false //is the game paused? (by the player or an unfocus event)
let gateText = "" //text below the pen
let intro = true //am I in the intro sequence?
let introTicks = 0 //how long has the intro been happening?
let level = 1 //the current level
let font //font (used later)
let fright = 0 //how long a power pellet has left
let frightScore = 200 //score for eating a ghost
let texts = [] // list of display text instances
let score = 0 //score of the player
let gameState = "menu"
let livesEnabled = true
let dotRamp = true
let dotScore = 10
let dotsToRamp = 10
let startLevel = 1
let speedRamp = 0
let rampValues = ["off","ghost","level"] //off = no ramp, ghost = ramp up on ghost eaten, level = ramp up on level progression
let speedIncreaseAmount = 0.01 //how fast it increases
let ghostsRamp = 4 //amount of ghosts needing to be eaten to speed ramp up
let sprites
let useSprites = true
let loaded = false
let startSpeed = 0.1
let fruitSpawn = [0,0]
let penLoc = [0,0] //ghost pen location
let useModulo = true
let failLoad = false
let url = new URL(window.location.href)
if (url.searchParams.getAll("code").length > 0){
  var levelCode = url.searchParams.getAll("code")[0]
  levelCode = levelCode.split("-")
  var validPlayer = false
  let dots = false
  let respawnpoint = false
  for (i of levelCode){
    levelCode[levelCode.indexOf(i)] = atob(i)
    strI = atob(i).toLowerCase()
    if (strI.includes("p")){
      validPlayer = true
    }
    if (strI.includes(".")){
      dots = true
    }
    if (strI.includes("g")){
      respawnpoint = true
    }
  }
  
  if (validPlayer && dots && respawnpoint){
    console.log("code loaded: "+levelCode)
    textMap = levelCode
    delete buttons.main
    buttons.main = {} //both need to be recreated to get them in the correct order.
    buttons.main["play custom level"] = () => {gameState = "game"; lives = 0; reset(true)}
    buttons.main["options"] = () => {menuIndex = "options";selectedIndex = 0}
  }else{
    alert("the current level code could not be loaded because it is missing elements required for a valid level. "+`pacman:${validPlayer}, dots:${dots}`+`, ghost respawn point:${respawnpoint}`)
  }
}

function toBool(string){
  return string == "true" ? true : false
}

if (localStorage.getItem("settings") == null){
	localStorage.setItem("settings",true)
	localStorage.setItem("dotWave",String(dotWave))
	localStorage.setItem("livesEnabled",String(livesEnabled))
	localStorage.setItem("startLevel",startLevel)
	localStorage.setItem("speedRamp",speedRamp)
	localStorage.setItem("speedIncreaseAmount",speedIncreaseAmount)
  localStorage.setItem("useSprites",true)
  localStorage.setItem("useModulo",true)
}else{
  useModulo = toBool(localStorage.getItem("useModulo"))
	dotWave = toBool(localStorage.getItem("dotWave"))
	livesEnabled = toBool(localStorage.getItem("livesEnabled"))
	startLevel = Number(localStorage.getItem("startLevel"))
	speedRamp = Number(localStorage.getItem("speedRamp"))
	speedIncreaseAmount = Number(localStorage.getItem("speedIncreaseAmount"))
  useSprites = toBool(localStorage.getItem("useSprites"))
}

window.onkeydown = ({key}) => { //on key down
	if (!input.includes(key)){ //if key not already in list
		input.push(key) //add it to the list
	}
	if (key == " "){ //if key space: pause
		pause()
	}
}

function pause(value = null){ //set paused
	paused = value == null ? !paused : value
	gateText = paused ? "paused!" : ""
}

window.onkeyup = ({key}) => {// on key up
	input.splice(input.indexOf(key),1) //remove key from list
}

window.onresize = () => { //on resize
	resizeCanvas(window.innerWidth,window.innerHeight) //resize the canvas to window size
	CELL = window.innerHeight/32 //adjust the cell size
	anchor = ((window.innerWidth/CELL)/2) - (14) //re-anchor the game
	for (let i of dots){
		i.redoDisp()
	}
	for (let i of walls){
		i.redoDisp()
	}
}

window.onblur = () => { //when unfocused the game pauses forcably
	pause(true)
}

class dispText{ //display text
	constructor(t,x,y,time=500,size=1){
		this.text = t //text
		this.pos = dispCoords(createVector(x,y),true) //where is it?
		this.time = time //how long it should display?
		texts.push(this) //add it to the list
		this.size = size  
	}
	show(){ //display
		textSize(this.size*CELL)
		this.time -= deltaTime //reduce display time
		if (this.time <= 0){ //remove self from list when done displaying self
			texts.splice(texts.indexOf(this),1)
		}
		fill(0xff) //fill white
		text(this.text,this.pos.x,this.pos.y) //display the text
	}
}

function dispCoords(v,center = false){ //get display coordinates
	vec = createVector(0,0) //copy the vector so original isn't modified
	vec.set(v)
	vec.x = (anchor+vec.x+(0.5*center))*CELL
	vec.y = (vec.y+(0.5*center))*CELL
	return vec //return the new value
}

dots = [] //list of dots
class dot{ 
	constructor(x,y){
		this.pos = createVector(x,y)
		dots.push(this)
		this.disp = dispCoords(this.pos)
	}

	redoDisp(){
		this.disp = dispCoords(this.pos)
	}
	
	show(){
		if (dotWave){ //if wavy dots
			push() //save draw settings
			fill(0xff) //fill white
			noStroke() //no lines

			let offset = this.pos.x * this.pos.y
			
			translate(
				this.disp.x + 
				Math.sin(ticks/10 + offset),
				this.disp.y + 
				Math.cos(ticks/10 + offset)//+ this.pos.y)
			) //translate the drawing to the right position
			//rotate((ticks+this.pos.x)*-4) //rotate the drawing
			circle(0,0,CELL*0.3) //draw the dot off center so it orbits around the center
			pop() //load draw settings
		}else{
			fill(0xff)
			noStroke()
			circle(this.disp.x,this.disp.y,CELL*0.3)
		}
	}
}

class powerPellet extends dot{ //power pellets
	show(){
		let disp = dispCoords(this.pos)
		noStroke()
		fill(0xff,0xff,0xff,255*(ticks % 60 < 30))
		circle(disp.x,disp.y,CELL*0.75)
	}
}

function reset(full=false){ //reset the game
	walls = [] //clear walls
	inters = [] //clear intersections
	tunnels = [] //clear tunnel instances
	ghosts = [] //clear ghosts
  introTicks = 0 //reset intro time
  intro = true
	if (full){ //if full
		dots = [] //clear dots
    if (lives <= 0){
      dotScore = 10
		  level = startLevel //reset level
      gameSpeed = startSpeed
      lives = 3 //reset lives
      score = 0
    }
	}
	fright = 0 //reset fright ticks
	setupMap(full) //reset map
}

function preload(){ //preload the custom pacman font :)
	font = loadFont("font.ttf")
  try{
    sprites = {
      "blinky":[
        loadImage("sprites/ghosts/blinky/00.png"),
        loadImage("sprites/ghosts/blinky/01.png"),
        loadImage("sprites/ghosts/blinky/10.png"),
        loadImage("sprites/ghosts/blinky/11.png"),
        loadImage("sprites/ghosts/blinky/20.png"),
        loadImage("sprites/ghosts/blinky/21.png"),
        loadImage("sprites/ghosts/blinky/30.png"),
        loadImage("sprites/ghosts/blinky/31.png")
      ],
      "pinky":[
        loadImage("sprites/ghosts/pinky/00.png"),
        loadImage("sprites/ghosts/pinky/01.png"),
        loadImage("sprites/ghosts/pinky/10.png"),
        loadImage("sprites/ghosts/pinky/11.png"),
        loadImage("sprites/ghosts/pinky/20.png"),
        loadImage("sprites/ghosts/pinky/21.png"),
        loadImage("sprites/ghosts/pinky/30.png"),
        loadImage("sprites/ghosts/pinky/31.png")
      ],
      "inky":[
        loadImage("sprites/ghosts/inky/00.png"),
        loadImage("sprites/ghosts/inky/01.png"),
        loadImage("sprites/ghosts/inky/10.png"),
        loadImage("sprites/ghosts/inky/11.png"),
        loadImage("sprites/ghosts/inky/20.png"),
        loadImage("sprites/ghosts/inky/21.png"),
        loadImage("sprites/ghosts/inky/30.png"),
        loadImage("sprites/ghosts/inky/31.png")
      ],
      "clyde":[
        loadImage("sprites/ghosts/clyde/00.png"),
        loadImage("sprites/ghosts/clyde/01.png"),
        loadImage("sprites/ghosts/clyde/10.png"),
        loadImage("sprites/ghosts/clyde/11.png"),
        loadImage("sprites/ghosts/clyde/20.png"),
        loadImage("sprites/ghosts/clyde/21.png"),
        loadImage("sprites/ghosts/clyde/30.png"),
        loadImage("sprites/ghosts/clyde/31.png")
      ],
      "fright":[
        loadImage("sprites/ghosts/fright/00.png"),
        loadImage("sprites/ghosts/fright/01.png"),
        loadImage("sprites/ghosts/fright/10.png"),
        loadImage("sprites/ghosts/fright/11.png")
      ],
      "eyes":[
        loadImage("sprites/ghosts/eyes/0.png"),
        loadImage("sprites/ghosts/eyes/1.png"),
        loadImage("sprites/ghosts/eyes/2.png"),
        loadImage("sprites/ghosts/eyes/3.png")
      ]
    }
    setTimeout(() => { //load seperately to avoid 429 too many requests
      sprites.pacwalk = [
        loadImage("sprites/pacman/normal/0.png"),
        loadImage("sprites/pacman/normal/00.png"),
        loadImage("sprites/pacman/normal/01.png"),
        loadImage("sprites/pacman/normal/10.png"),
        loadImage("sprites/pacman/normal/11.png"),
        loadImage("sprites/pacman/normal/20.png"),
        loadImage("sprites/pacman/normal/21.png"),
        loadImage("sprites/pacman/normal/30.png"),
        loadImage("sprites/pacman/normal/31.png")
      ]
      sprites.pacdeath = [
        loadImage("sprites/pacman/death/0.png"),
        loadImage("sprites/pacman/death/1.png"),
        loadImage("sprites/pacman/death/2.png"),
        loadImage("sprites/pacman/death/3.png"),
        loadImage("sprites/pacman/death/4.png"),
        loadImage("sprites/pacman/death/5.png"),
        loadImage("sprites/pacman/death/6.png"),
        loadImage("sprites/pacman/death/7.png"),
        loadImage("sprites/pacman/death/8.png"),
        loadImage("sprites/pacman/death/9.png"),
        loadImage("sprites/pacman/death/10.png")
      ]
      loaded = true
    }, 1000)
  }catch(e){
    alert("your network didn't let the sprites load, will play without sprites, reload to retry")
    failLoad = true
  }
}

let cam

function setup(){ //setup the game
	resizeCanvas(window.innerWidth,window.innerHeight) //resize canvas to window size
	strokeWeight(1) //set line weight for text mainly
	window.onresize() //call window resize event to set up cell size and anchor
	directionVectors = [createVector(1,0),createVector(0,-1),createVector(-1,0),createVector(0,1)] //set direction vectors
	reset(true) //reset the map for the first time
	angleMode(DEGREES) //set angle mode
	textFont(font) //use the pacman font
	textAlign(CENTER,CENTER) //align text centered
  noSmooth()
  imageMode(CENTER)
  cam = createVector()
}

function draw(){
  if (!loaded && !failLoad){ //make sure the pacman sprites loaded correctly
    return
  }else if (failLoad){
    useSprites = false
  }
	if (gameState == "game"){
		game()
	}
	if (gameState == "menu"){
		drawMenuButtons()
	}
}

function game(){ //mainloop
  cam.set((p.pos.x+anchor)*CELL - width/2,p.pos.y*CELL - height/2)
	translate(cam.copy().mult(-1))
  ticks++ //count up ticks
	background(0) //make bg black
	if (intro){// if im in the intro
		if (!paused){ //if im not paused
			stopped = true //stop game
			introTicks++//count up intro ticks
			gateText = introTicks > 150 ? "Go!" : "Ready?" //set gate text
		}
		
		if (introTicks > 180){ //end of intro
			intro = false //not in intro anymore
			introTicks = 0 //intro ticks reset
			gateText = "" //gate text reset
			stopped = false //not stopped anymore
		}
	}

	if (paused && (input.includes("Backspace")) || input.includes("Delete")){
		paused = false
    gateText = ""
		gameState = "menu"
	}
	
	if (!stopped && !paused){ //if not stopped or paused fright -= 1
		fright -= 1
	}
	if (debug){ //if in debug mode draw intersections and tunnels 
		for (let i of inters){
			i.show()
		}
		for (let i of tunnels){
			i.show()
		}
	}
	fill(0x0,0x0,0xff) //fill with blue
	stroke(0x0,0x0,0xff) //blue lines
	for (let i of walls){ //draw walls
		if (dots.length == 0 && ticks % 60 < 30){ //flash while if no dots
			fill(0xff,0xff,0xff)
			stroke(0xff,0xff,0xff)
		}
		i.show() //show the wall
	}
	for (let i of dots){ //show dots
		i.show()
	}
  
	for (let i of ghosts){ //update and show ghosts
		if (!stopped && !paused){
			i.update()
		}
		i.show()
	}
	if (!stopped && !paused){ //update and show pacman
		p.update()
	}else if(p.dead){ //if pacman is dead run dead pacman code
		p.die()
	}
	p.show()

  noStroke()
	for (i of texts){ //show display texts
		i.show()
	}

	if (!stopped && !paused){ //detect if no dots exist
		if (dots.length == 0){
			stopped = true //stop game
			level++ //increase level
			setTimeout(() => { // reset after a bit
				stopped = false
				reset(true)
				intro = true
				introTicks = 0
				if (speedRamp == 2){
					gameSpeed = min(gameSpeed + speedIncreaseAmount,0.2)
				}
			},3000)
		}
	}
  
  textSize(CELL*2)
  stroke(0xff,0xa5,0x0)
  strokeWeight(CELL/4)
  fill(0xff,0xff,0x0)
  
  text(gateText,cam.x+width/2,cam.y+height/2) //draw gate text

  noStroke() //no line full white
  fill(0xff)
	textSize(CELL/2) //set text size
	
	text(`level: ${level}`,cam.x+((anchor + textMap[0].length + 0.5) *CELL)-font.textBounds(`level: ${level}`,0,0,CELL/2).w,cam.y+(height-CELL))
	text (`{${score}}`,cam.x+(width/2),cam.y+(height-CELL))
	
	if (frameRate() < 30){
		fill(0xff,0,0)
	}
	text(`${round(frameRate())}`,cam.x+CELL,cam.y+CELL) //show framerate
	fill(0xff)

	if (speedRamp != 0){
		text(`${round(gameSpeed*10,1)}`,cam.x+CELL*2,cam.y+height/2)
	}
	
	textSize(CELL) //reset text size
}