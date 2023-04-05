Player.prototype.reset = function() {
  this.score = 0;
	this.lives = 1;
	this.eaten = 0;
	this.resetPlayerPosition();
};

Player.prototype.newLevel = function() {
	this.eaten = 0;
	this.resetPlayerPosition();
};

Player.prototype.resetPlayerPosition = function() {
  this.position = {
		x: 90,
		y: 120,
	};
	this.direction = DIRECTIONS.LEFT;
	this.due = DIRECTIONS.LEFT;
};

Player.prototype.loseLife = function() {
	this.lives = this.lives - 1;
};

Player.prototype.getLives = function() {
	return this.lives;
};
