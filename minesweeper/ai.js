//Felix Albrigtsen 2019
//Auto logic for minesweeper, not required for actual gameplay.

var botTimer = undefined;

function autoMove() {
	//Automatically chose the statistically best move to do. The machine only has the same info as the player.
	//When it knows nothing: Select by random.
	//For each untouched cell(not marked and not revealed), generate the probability of the cell being a bomb.
	//For a cell with 100% chance of being a bomb, instantly mark it.
	//For a cell with 0% chance of being a bomb, reveal it.
	//If no cells have 100% or 0% chance, reveal the one with the highest probability
	//The probability of a cell is calculated by taking the average of each revealed neighbor cell's (neighbor mines - marked neighbors).
	//		Unless one or more of its neighbors gives it a 0% or 100%.

	timer_hasCheated = true;
	
    if (finished) { clearInterval(botTimer); return; }
    var probabilityBoard = []; 

	for(var index = 0; index < board.length; index++) {
		probabilityBoard.push(calculateProbability(index));
    }

    var lowestChance = [1, -1]; // [value, index]
    
    for (var i = 0; i < board.length; i++) {
        if (probabilityBoard[i] == 1) {
            interact(i%cols, (i-(i%cols))/cols, true);
            return;
        }

        if (probabilityBoard[i] == 0) {
            interact(i%cols, (i-(i%cols))/cols, false);
            return;
        }

        if ((probabilityBoard[i] < lowestChance[0]) && (probabilityBoard[i] != -1)) {
            lowestChance = [probabilityBoard[i], i];
        }
    }

    var lowestChanceIndex = lowestChance[1];
    var x = lowestChanceIndex%cols;
    var y = (lowestChanceIndex - x) / cols;

    interact(x, y, false);
    console.log("Choosing " + lowestChanceIndex + " with a bomb chance of " + lowestChance[0].toString());
    
}


function calculateProbability(index) {
    if (board[index].revealed) { //Can't be a bomb, don't even consider it
        return -1;
    }

    if (board[index].marked) { //MUST be a bomb, ignore it
        return 2;
    }

	var neighborIndexes = neighborIndexOffsets.map(x => x + index);
    var usefulNeighbors = [];
	for (var i = 0; i < neighborIndexes.length; i++) {
		if ((neighborIndexes[i] < board.length) && (neighborIndexes[i] >= 0) && (abs((index%cols) - board[neighborIndexes[i]].x) <= 1)) {
			if (board[neighborIndexes[i]].revealed) {
				usefulNeighbors.push(neighborIndexes[i]);
			}
		}
	}

	if (usefulNeighbors.length == 0) { //If we dont know anything, use the random chance value
		return ((mineCount-markedBombs) / (rows*cols));
	}

    var neighborChances = [];

	for (var i = 0; i < usefulNeighbors.length; i++) {
        var markedNeighbors = countMarkedNeighbors(usefulNeighbors[i]);
		var missingMarks = board[usefulNeighbors[i]].neighbors - markedNeighbors;
		var untouchedNeighbors = countUntouchedNeighbors(usefulNeighbors[i]);

		if (missingMarks == untouchedNeighbors + markedNeighbors) {
			return 1; //100 %
		}

		if (missingMarks == 0) {
			return 0; //0%, all mines are marked
        }
        
        neighborChances.push(missingMarks / untouchedNeighbors);
    }
    
    //return average(neighborChances);
    return maxValue(neighborChances);

}

function countMarkedNeighbors(index) {
    var neighborIndexes = neighborIndexOffsets.map(x => x + index);
    var markedNeighbors = 0;
    for (var i = 0; i < neighborIndexes.length; i++) {
        if ((neighborIndexes[i] >= 0) && (neighborIndexes[i] < board.length) && (abs((index%cols) - board[neighborIndexes[i]].x) <= 1)) {
            if (board[neighborIndexes[i]].marked) {
                markedNeighbors++;
            }
        }
    }

    return markedNeighbors;
}

function countUntouchedNeighbors(index) {
    var neighborIndexes = neighborIndexOffsets.map(x => x + index);
    var untouchedNeighbors = 0;
    for (var i = 0; i < neighborIndexes.length; i++) {
        if ((neighborIndexes[i] >= 0) && (neighborIndexes[i] < board.length) && (abs((index%cols) - board[neighborIndexes[i]].x) <= 1)) {
            if ((!board[neighborIndexes[i]].marked) && (!board[neighborIndexes[i]].revealed)) {
                untouchedNeighbors++;
            }
        }
    }

    return untouchedNeighbors;
}

function average(list) {
    var sum = 0;
    var len= list.length;
    for (var i = 0; i < len; i++) {
        sum += list[i];
    }
    return sum/len;
}

function maxValue(list) {
    if (list.length == 0) { return -1; }

    var largest = list[0];
    for (var i = 1; i < list.length; i++) {
        if (list[i] > largest) {
            largest = list[i];
        }
    }

    return largest;
    
}