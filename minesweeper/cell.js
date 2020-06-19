//Felix Albrigtsen 2019
//Cell object and methods for minesweeper.

class Cell {
	constructor(x_, y_) {
		this.mine = false;
		this.revealed = false;
		this.marked = false;
		this.x = x_;
		this.y = y_;
		this.boardIndex = (this.y*cols) + this.x;
	}

	mark() {
		this.marked = !this.marked;
	}

	countNeighbors() {
		var neighborIndexes = neighborIndexOffsets.map(x => x + this.boardIndex);
		var neighborMines = 0;

		for (var i = 0; i < neighborIndexes.length; i++) {
			if (((neighborIndexes[i] >= 0) && (neighborIndexes[i] < board.length)) && (abs(this.x - board[neighborIndexes[i]].x) <= 1)) {
				if (board[neighborIndexes[i]].mine) { neighborMines++; }
			}
		}

		this.neighbors = neighborMines;
	}

	reveal() {
		if (this.mine) {
			//Game over, instant loss
			gameover = true;
			for (var i = 0; i < board.length; i++) {
				if (!board[i].mine) { board[i].reveal(); }
			}
		} else {
			this.revealed = true;
		}

		if (this.neighbors == 0) {
			var neighborIndexes = neighborIndexOffsets.map(x => x + this.boardIndex);
			for (var i = 0; i < neighborIndexes.length; i++) {
				if (((neighborIndexes[i] >= 0) && (neighborIndexes[i] < board.length)) && (abs(this.x - board[neighborIndexes[i]].x) <= 1)) {
					if (!board[neighborIndexes[i]].revealed) {
						board[neighborIndexes[i]].reveal();
					}
				}
			}
		}
	}
}
