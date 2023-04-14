function preload() {
  bg = loadImage('img/Spelscherm.jpg')
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
    this.level = 5;
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
    ghost.speed = 0.02 * this.level
    this.ghosts.push(ghost)
  }
	this.timerStart = this.tick;
	this.setState(STATES.COUNTDOWN);
};

Game.prototype.loseLife = function() {
	this.setState(STATES.WAITING);
  this.player.loseLife()
  if (this.player.getLives() > 0) {
    this.startLevel()
  } else {
    this.bezig = false;
  }
};

Game.prototype.completedLevel = function() {
  background(bg);
  this.setState(STATES.WAITING);
	this.level = this.level + 1;
  this.startLevel()
};
