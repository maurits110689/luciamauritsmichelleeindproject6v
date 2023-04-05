Ghost.prototype.getRandomDirection = function() {
  let moves;
  if (this.direction === DIRECTIONS.LEFT || this.direction === DIRECTIONS.RIGHT) {
    moves = [DIRECTIONS.UP, DIRECTIONS.DOWN];
  } else {
    moves = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
  }
  return moves[Math.floor(Math.random() * 2)];
}

Ghost.prototype.reset = function() {
  this.eaten = null;
  this.eatable = null;
  this.position = {
    x: 90,
    y: 80,
  };
  this.direction = this.getRandomDirection();
  this.due = this.getRandomDirection();
}

Ghost.prototype.isVunerable = function() {
  return this.eatable !== null;
}

Ghost.prototype.isDangerous = function() {
  return this.eaten === null;
}

Ghost.prototype.isHidden = function() {
  return !this.isVunerable() && !this.isDangerous();
}

Ghost.prototype.oppositeDirection = function(dir) {
  let oppositeDirection;
  switch (dir) {
    case DIRECTIONS.LEFT:
      oppositeDirection = DIRECTIONS.RIGHT;
      break;
    case DIRECTIONS.RIGHT:
      oppositeDirection = DIRECTIONS.LEFT;
      break;
    case DIRECTIONS.UP:
      oppositeDirection = DIRECTIONS.DOWN;
      break;
    case DIRECTIONS.DOWN:
      oppositeDirection = DIRECTIONS.UP;
      break;
  }
  return oppositeDirection;
}