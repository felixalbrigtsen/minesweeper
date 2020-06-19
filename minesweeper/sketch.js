//Felix Albrigtsen 2019
//Main code for minesweeper, dependent on cell.js, and partly on ai.js.

//Display and board settings
var cellSize = 23;
var padding = 3;
var rows = 16;
var cols = 16;
var mineCount = 30;
var canvWidth = (cols * (cellSize + padding)) + 1.5*padding;
var canvHeight = (rows * (cellSize + padding)) + 1.5*padding;

//Game state variables
var finished = false;
var gameover = false;
var markedBombs = 0;
var board = [];

//Calculate these values once, instead of each time
var neighborIndexOffsets = [-cols-1, -cols, -cols+1, -1, 1, cols-1, cols, cols+1];

var refreshPage = true; //Refresh when changing difficulty
var refreshPage_reset = false; // Do not refresh when hitting R, it takes too long


function setDifficulty(level) {
	switch (level) {
		case 0:
			rows = 10;
			cols = 10;
			padding = 3;
			mineCount = 10;
			break;
		case 1:
			rows = 16;
			cols = 16;
			padding = 3;
			mineCount = 38;
			break;
		case 2:
			rows = 20;
			cols = 22;
			padding = 2;
			mineCount = 88;
			break;
		case 3:
			rows = 30;
			cols = 32;
			padding = 2;
			mineCount = 192;
			break;
		default:
			rows = 16;
			cols = 16;
			padding = 3;
			mineCount = 38;

	}
	
	//CanvWidth = cols * (padding + cellsize)
	//cellsize = canvWidth / cols - padding

	//var boardMaxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.75;
	//cellSize = ((boardMaxHeight / rows)-padding) + (3-level);

	var boardMaxWidth = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.7;
	cellSize = ((boardMaxWidth / cols)-padding) + (3-level);
	
	while (cols * (padding + cellSize) > Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) {
		cellSize--;
	}
	
	canvWidth = (cols * (cellSize + padding)) + 1.5*padding;
	canvHeight = (rows * (cellSize + padding)) + 1.5*padding; 
	
	neighborIndexOffsets = [-cols-1, -cols, -cols+1, -1, 1, cols-1, cols, cols+1]
	reset();
}

function setup() {
	noLoop();
	reset();
	if (getURLParams().d != undefined) {
		setDifficulty(parseInt(getURLParams().d));
	} else {
		setDifficulty(1);
	}
}

function reset() {
	createCanvas(canvWidth, canvHeight).parent("canvasDiv");
	textSize(cellSize);

	board = [];
	finished = false;
	gameover = false;
	markedBombs = false;

	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			board.push(new Cell(j, i));
		}
	}

	placeMines();

	for (var i = 0; i < board.length; i++) {
		board[i].countNeighbors();
	}

	draw();
	
	timer_running = false;
	if (timerInterval) { clearInterval(timerInterval); }
	timerInterval = undefined;
	timer_hasCheated = false;
	timer_ms = -1;
	timerTick();
	
}

function draw() {
	markedBombs = 0;
	background(50);
	
	if (gameover || finished) {
		stopTimer();
	}
	
	for (var i = 0; i < board.length; i++) {
		if (board[i].revealed) {
			fill(200);
		} else {
			fill(100);
			if (board[i].marked) {
				fill(255, 100, 0);
				markedBombs++;
			}
			if (finished) {
				fill(0, 255, 0);
			}
		}

		if (gameover && board[i].mine) {
			fill(255,0,0);
		}

		rect(board[i].x * (cellSize + padding) + padding, board[i].y * (cellSize + padding) + padding, cellSize, cellSize);
		
		if (board[i].revealed) {
			fill(50);
			if (board[i].neighbors != 0) {
				text(board[i].neighbors, (board[i].x + 0.32) * (cellSize + padding), (board[i].y+0.9) * (cellSize + padding));
			}
		} 
	}
}

function placeMines() {
	var placed = 0;
	while (placed != mineCount) {
		//Place mines, make sure that the same square isn't selected again
		var i = Math.floor(Math.random() * board.length);

		if (!board[i].mine) {
			board[i].mine = true;
			placed++;
		}
	}
}

function test_finished() {
	for (var i = 0; i < board.length; i++) {
		if (board[i].mine && !board[i].marked) { return false;}
		if (!board[i].revealed && !board[i].mine) { return false; }
	}

	return true;
}

function interact(x, y, mark) {
	if (document.getElementById("helpOverlay").style.display == "block") { return; }
	
	var index = (y * cols) + x;
	//console.log("x: " + x.toString() + "   y: " + y.toString());
	if (mark) {
		board[index].mark();
	} else {
		board[index].reveal();
	}

	finished = test_finished();
	
	if (!timer_running) {
		startTimer();
	}
	
	draw();
}

function mouseClicked() {

	if ((mouseX < 0) || (mouseX >= canvWidth)) { return; }
	if ((mouseY < 0) || (mouseY >= canvHeight)) { return; }

	var ix = Math.floor((mouseX-padding) / (cellSize + padding));
	var iy = Math.floor((mouseY-padding) / (cellSize + padding));

	interact(ix, iy, keyIsDown(SHIFT));
}

function keyPressed() {
	if (keyIsDown(82)) { //Reset when you click R
		if (refreshPage_reset) {
			window.location.reload();
		} else {
			reset();
		}
	}

	if (keyIsDown(65)) {
		autoMove(false); //Automove when you click A
	}

	if (keyIsDown(87)) { //Click with W
		var ix = Math.floor((mouseX-padding) / (cellSize + padding));
		var iy = Math.floor((mouseY-padding) / (cellSize + padding));

		interact(ix, iy, false);
	}

	if (keyIsDown(81)) { //Mark with Q
		var ix = Math.floor((mouseX-padding) / (cellSize + padding));
		var iy = Math.floor((mouseY-padding) / (cellSize + padding));

		interact(ix, iy, true);
	}
}

