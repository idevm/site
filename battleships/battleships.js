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
		{locations: [0, 0, 0], hits: ['', '', '']},
		{locations: [0, 0, 0], hits: ['', '', '']},
		{locations: [0, 0, 0], hits: ['', '', '']}
	],
	hitLocations: [],
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
	generateSipLocations: function (){
		var locations;
		for (var i = 0; i < this.numShips; i++){
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},
	generateShip: function (){
		var direction = Math.floor(Math.random() * 2);
		var row, col;
		if (direction === 1){
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		} else {
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);			
		}
		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++){
			if (direction === 1){
				newShipLocations.push(row + '' + (col + i));
			} else {
				newShipLocations.push((row + i) + '' + col);
			}
		}
		return newShipLocations;
	},
	collision: function (locations){
		for (var i = 0; i < this.numShips; i++){
			var ship = model.ships[i];
			for (var j = 0; j < locations.length; j++){
				if (ship.locations.indexOf(locations[j]) >= 0){
					return true;
				}
			}
		}
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
				document.getElementById('table').remove();
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
		} else if (model.hitLocations.indexOf(row + column) >= 0){
			alert('Сюда уже стреляли!');
		} else {
			model.hitLocations.push(row + column);
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
	model.generateSipLocations();
	document.getElementById("00").addEventListener('click', function (e){var guess = 'a0'; controller.processGuess(guess)});
	document.getElementById("01").addEventListener('click', function (e){var guess = 'a1'; controller.processGuess(guess)});
	document.getElementById("02").addEventListener('click', function (e){var guess = 'a2'; controller.processGuess(guess)});
	document.getElementById("03").addEventListener('click', function (e){var guess = 'a3'; controller.processGuess(guess)});
	document.getElementById("04").addEventListener('click', function (e){var guess = 'a4'; controller.processGuess(guess)});
	document.getElementById("05").addEventListener('click', function (e){var guess = 'a5'; controller.processGuess(guess)});
	document.getElementById("06").addEventListener('click', function (e){var guess = 'a6'; controller.processGuess(guess)});
	document.getElementById("10").addEventListener('click', function (e){var guess = 'b0'; controller.processGuess(guess)});
	document.getElementById("11").addEventListener('click', function (e){var guess = 'b1'; controller.processGuess(guess)});
	document.getElementById("12").addEventListener('click', function (e){var guess = 'b2'; controller.processGuess(guess)});
	document.getElementById("13").addEventListener('click', function (e){var guess = 'b3'; controller.processGuess(guess)});
	document.getElementById("14").addEventListener('click', function (e){var guess = 'b4'; controller.processGuess(guess)});
	document.getElementById("15").addEventListener('click', function (e){var guess = 'b5'; controller.processGuess(guess)});
	document.getElementById("16").addEventListener('click', function (e){var guess = 'b6'; controller.processGuess(guess)});
	document.getElementById("20").addEventListener('click', function (e){var guess = 'c0'; controller.processGuess(guess)});
	document.getElementById("21").addEventListener('click', function (e){var guess = 'c1'; controller.processGuess(guess)});
	document.getElementById("22").addEventListener('click', function (e){var guess = 'c2'; controller.processGuess(guess)});
	document.getElementById("23").addEventListener('click', function (e){var guess = 'c3'; controller.processGuess(guess)});
	document.getElementById("24").addEventListener('click', function (e){var guess = 'c4'; controller.processGuess(guess)});
	document.getElementById("25").addEventListener('click', function (e){var guess = 'c5'; controller.processGuess(guess)});
	document.getElementById("26").addEventListener('click', function (e){var guess = 'c6'; controller.processGuess(guess)});
	document.getElementById("30").addEventListener('click', function (e){var guess = 'd0'; controller.processGuess(guess)});
	document.getElementById("31").addEventListener('click', function (e){var guess = 'd1'; controller.processGuess(guess)});
	document.getElementById("32").addEventListener('click', function (e){var guess = 'd2'; controller.processGuess(guess)});
	document.getElementById("33").addEventListener('click', function (e){var guess = 'd3'; controller.processGuess(guess)});
	document.getElementById("34").addEventListener('click', function (e){var guess = 'd4'; controller.processGuess(guess)});
	document.getElementById("35").addEventListener('click', function (e){var guess = 'd5'; controller.processGuess(guess)});
	document.getElementById("36").addEventListener('click', function (e){var guess = 'd6'; controller.processGuess(guess)});
	document.getElementById("40").addEventListener('click', function (e){var guess = 'e0'; controller.processGuess(guess)});
	document.getElementById("41").addEventListener('click', function (e){var guess = 'e1'; controller.processGuess(guess)});
	document.getElementById("42").addEventListener('click', function (e){var guess = 'e2'; controller.processGuess(guess)});
	document.getElementById("43").addEventListener('click', function (e){var guess = 'e3'; controller.processGuess(guess)});
	document.getElementById("44").addEventListener('click', function (e){var guess = 'e4'; controller.processGuess(guess)});
	document.getElementById("45").addEventListener('click', function (e){var guess = 'e5'; controller.processGuess(guess)});
	document.getElementById("46").addEventListener('click', function (e){var guess = 'e6'; controller.processGuess(guess)});
	document.getElementById("50").addEventListener('click', function (e){var guess = 'f0'; controller.processGuess(guess)});
	document.getElementById("51").addEventListener('click', function (e){var guess = 'f1'; controller.processGuess(guess)});
	document.getElementById("52").addEventListener('click', function (e){var guess = 'f2'; controller.processGuess(guess)});
	document.getElementById("53").addEventListener('click', function (e){var guess = 'f3'; controller.processGuess(guess)});
	document.getElementById("54").addEventListener('click', function (e){var guess = 'f4'; controller.processGuess(guess)});
	document.getElementById("55").addEventListener('click', function (e){var guess = 'f5'; controller.processGuess(guess)});
	document.getElementById("56").addEventListener('click', function (e){var guess = 'f6'; controller.processGuess(guess)});
	document.getElementById("60").addEventListener('click', function (e){var guess = 'g0'; controller.processGuess(guess)});
	document.getElementById("61").addEventListener('click', function (e){var guess = 'g1'; controller.processGuess(guess)});
	document.getElementById("62").addEventListener('click', function (e){var guess = 'g2'; controller.processGuess(guess)});
	document.getElementById("63").addEventListener('click', function (e){var guess = 'g3'; controller.processGuess(guess)});
	document.getElementById("64").addEventListener('click', function (e){var guess = 'g4'; controller.processGuess(guess)});
	document.getElementById("65").addEventListener('click', function (e){var guess = 'g5'; controller.processGuess(guess)});
	document.getElementById("66").addEventListener('click', function (e){var guess = 'g6'; controller.processGuess(guess)});
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