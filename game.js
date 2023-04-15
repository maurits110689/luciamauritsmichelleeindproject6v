function preload() {
  soundFormats('m4a', 'mp3', 'ogg')
  bg = loadImage('img/Spelscherm.jpg')
  clock = loadSound('music/clock.mp3')
}

var clock = new Audio('music/clock.mp3');
var fail = new Audio('music/fail.mp3');
var levelup = new Audio('music/levelup.mp3');

function setup() {
  createCanvas(1128, 790)
}

Game.prototype.initialize = function() {
  this.player = new Player(this, this.map);

	this.ghostColors = [
		"green",
		"cyan",
		"maroon",
		"fuchsia",
		"gold",
		"hotpink",
		"lime",
		"orangered",
		"peru",
		"steelblue"
	];
};

Game.prototype.startNewGame = function() {
  if (!this.bezig) {
    this.setState(STATES.WAITING);
    this.level = 1;
    this.player.reset();
    this.startLevel()
    this.bezig = true;
  }
};

Game.prototype.startLevel = function() {
  this.drawMap()
  this.player.newLevel()
	this.ghosts = [];
  for (let i = 0; i < this.level; i++) {
    let kleur = this.ghostColors[Math.floor(Math.random() * this.ghostColors.length)]
    let ghost = new Ghost(this, this.map, kleur)
    ghost.speed = 0.05 * this.level + 0.5;
    this.ghosts.push(ghost)
  }
	this.timerStart = this.tick;
	this.setState(STATES.COUNTDOWN);
  clock.play();
};

Game.prototype.loseLife = function() {
  fail.play();
  this.setState(STATES.WAITING);
  this.player.loseLife()
  if (this.player.getLives() > 0) {
    this.startLevel();
  } else {
    this.bezig = false;
  }
};

Game.prototype.completedLevel = function() {
  this.setState(STATES.WAITING);
	this.level = this.level + 1;
  levelup.play();
  this.startLevel()
};