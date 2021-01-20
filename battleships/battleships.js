var view = {
	displayMessage: function (msg){
		var messageArea = document.getElementById('messageArea');
		messageArea.innerHTML = msg;
	},
	displayStat: function (msg){
		var statArea = document.getElementById('stat');
		statArea.innerHTML = msg;		
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
					view.displayStat('Осталось кораблей: ' + (model.numShips - model.shipsSunk) + '. '
						+ 'Тип кораблей: ' + model.shipLength + '-х палубные.');
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
	confirm('В этой игре Вам предстоит стрелять по кораблям противника, спрятанным на игровом поле. Собственных кораблей у Вас нет. В бой!');
	var fireButton = document.getElementById('fireButton');
	fireButton.onclick = handleFireButton;
	var guessInput = document.getElementById('guessInput');
	guessInput.onkeypress = handleKeyPress;
	var reloading = document.getElementById('reload');
	reloading.addEventListener('click', function (e){window.location.reload()});
	model.generateSipLocations();
	view.displayStat('Осталось кораблей: ' + (model.numShips - model.shipsSunk) + '. '
		+ 'Тип кораблей: ' + model.shipLength + '-х палубные.');
	for (var i = 0; i < model.boardSize; i++){
		var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
		var dig1 = i.toString();
		var char1 = alphabet[i];
		for (var j = 0; j < model.boardSize; j++){
			var dig2 = j.toString();
			var idBoard = dig1 + dig2;
			const guessBoard = char1 + dig2;
			document.getElementById(idBoard).addEventListener('click', function (e){
				controller.processGuess(guessBoard)});
		}
	};
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