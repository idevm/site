var view = {
	displayMessage: function (msg){
		var messageArea = document.getElementById('messageArea');
		messageArea.innerHTML = msg;
	},
	displayHit: function (location){
		var cell = document.getElementById(location);
		cell.setAttribute('class', 'hit');
	},
	displayMiss: function (location){
		var cell = document.getElementById(location);
		cell.setAttribute('class', 'miss');
	}
};
var model = {
	boardSize: 7,
	numShips: 3,
	shipsSunk: 0,
	shipLength: 3,
	ships: [
		{locations: ['06', '16', '26'], hits: ['', '', '']},
		{locations: ['24', '34', '44'], hits: ['', '', '']},
		{locations: ['10', '11', '12'], hits: ['', '', '']}
	],
	fire: function (guess){
		for (var i = 0; i < this.numShips; i++){
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);
			if (index >= 0){
				ship.hits[index] = 'hit';
				view.displayHit(guess);
				view.displayMessage('РАНИЛ!');
				if (this.isSunk(ship)){
					view.displayMessage('УБИЛ!');
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage('МИМО!');
		return false;
	},
	isSunk: function (ship){
		for (var i = 0; i < this.shipLength; i++){
			if (ship.hits[i] !== 'hit'){
				return false;
			}
		}
		return true;
	}
};
var controller = {
	guesses: 0,
	processGuess: function (guess){
		var location = parseGuess(guess);
		if (location){
			this.guesses++;
			var hit = model.fire(location);
			if (hit && model.shipsSunk === model.numShips){
				view.displayMessage('Игра окончена. Вы потопили все корабли за ' 
					+ this.guesses + ' выстрелов');
				var end = document.getElementById('guessInput');
				end.removeAttribute('id');
			}
		}
	}
};
function parseGuess(guess){
	var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	if (guess === null || guess.length !== 2){
		alert ('Нужно ввести букву и цифру');
	} else {
		firstChar = guess.charAt(0);
		var row = alphabet.indexOf(firstChar.toUpperCase());
		var column = guess.charAt(1);
		if (isNaN(row) || isNaN(column)){
			alert ('Недопустимое значение ввода');
		} else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize){
			alert ('Не правильно указаны координаты!');
		} else {
			return row + column;
		}
	}
	return null;
};
function init (){
	var fireButton = document.getElementById('fireButton');
	fireButton.onclick = handleFireButton;
	var guessInput = document.getElementById('guessInput');
	guessInput.onkeypress = handleKeyPress;
};
function handleFireButton (){
	var guessInput = document.getElementById('guessInput');
	var guess = guessInput.value;
	controller.processGuess(guess);
	guessInput.value = '';
};
function handleKeyPress (e){
	var fireButton = document.getElementById('fireButton');
	if (e.keyCode === 13){
		fireButton.click();
		return false;
	}
};
window.onload = init;