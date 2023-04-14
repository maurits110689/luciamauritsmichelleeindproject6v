/*
	De game wordt opgestart:
		- een nieuwe speler wordt gekoppeld aan het Game-object en de map van het Game-object
		- de kleuren van de ghosts worden ingesteld.
*/
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

/*
	Wat moet er gebeuren bij het opstarten:
   - de state van het game wordt op WAITING gezet
	    = setState van het Game-object met de constante STATES
   - het level van het game wordt gereset naar 1
			= level-attribuut van Game-object
   - het player object van het game wordt gereset
	 		= reset-functie van Player-object die attribuut speler is van Game-object
   - de map wordt getekend
	 		= drawMap-functie van Game-object
   - het level van het spel wordt gestart
	 		= startLevel-functie van Game-object
*/
Game.prototype.startNewGame = function() {
  if (!this.bezig) {
    this.setState(STATES.WAITING);
    this.level = 5;
    this.player.reset();
    this.startLevel()
    this.bezig = true;
  }
};

/*
	Er wordt een nieuw level gestart:
		- de speler moet weten dat een nieuw level start
				= newLevel-functie van Player-object die attribuut speler is van Game-object
		- alle spoken moeten gereset worden
				= bestaande spoken verwijderen
				= nieuwe spoken aanmaken afhankelijk van het level
				= snelheid spook afhankelijk van het level
				= spook toevoegen aan de lijst van spoken
		- de timer moet gereset worden
				= timerStart-attribuut gelijk zetten aan huidige tick
		- de state van het game wordt op COUNTDOWN gezet
	    = setState van het Game-object met de constante STATES
*/
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

/*
	De speler verliest een leven:
		- de state van het game wordt op WAITING gezet
	    = setState van het Game-object met de constante STATES
		- de speler verliest een leven
			= loseLife-functie van het Player-object dat het attribuut 
		- check game over
			= game over is als de speler geen levens meer heeft anders mag een nieuw level gestart worden
*/
Game.prototype.loseLife = function() {
	this.setState(STATES.WAITING);
  this.player.loseLife()
  if (this.player.getLives() > 0) {
    this.startLevel()
  } else {
    this.bezig = false;
  }
};

/*
	Het level is uitgespeeld
		- de state van het game wordt op WAITING gezet
	    = setState van het Game-object met de constante STATES
		- het level-attribuut wordt verhoogd
		- het level van het spel wordt gestart
	 		= startLevel-functie van Game-object
*/
Game.prototype.completedLevel = function() {
	this.setState(STATES.WAITING);
	this.level = this.level + 1;
  this.startLevel()
};
