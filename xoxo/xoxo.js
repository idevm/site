var view = { //визуальное представление
	
	displayMessage: function (msg){ //вывод сообщений
		document.getElementById('messageArea').innerHTML = msg;
		if (msg === 'Вы выиграли!'){
			document.querySelector('#messageArea').style.color = 'green';
		} else if (msg === 'Вы проиграли!'){
			document.querySelector('#messageArea').style.color = 'red';
		} else {
			document.querySelector('#messageArea').style.color = 'blue';
		}
	},

	displayStat: function (){ //вывод счета и количества сыгранных партий
		document.getElementById('statArea').innerHTML = 'Счет ' + model.playerScore + ' : ' 
			+ model.AIScore + '<br>' + ' Сыграно партий: ' + model.rounds;
	},
	
	displaySym: function (location, sym){ //вывод ходов
		document.getElementById(location).setAttribute('class', sym);
	},	

	displayLine: function (name){ // вывод линии трех подряд символов
		if (name === 'row0'){
			document.querySelector('#winRow0').style.display = 'block';
		} else if (name === 'row1'){
			document.querySelector('#winRow1').style.display = 'block';					
		} else if (name === 'row2'){
			document.querySelector('#winRow2').style.display = 'block';										
		} else if (name === 'col0'){
			document.querySelector('#winCol0').style.display = 'block';					
		} else if (name === 'col1'){
			document.querySelector('#winCol1').style.display = 'block';										
		} else if (name === 'col2'){
			document.querySelector('#winCol2').style.display = 'block';															
		} else if (name === 'dia1'){
			document.querySelector('#winDia1').style.display = 'block';					
		} else {
			document.querySelector('#winDia2').style.display = 'block';
		}	
	},

	removeLine: function (){ // стереть победную линию
		document.querySelector('#winRow0').style.display = 'none';
		document.querySelector('#winRow1').style.display = 'none';					
		document.querySelector('#winRow2').style.display = 'none';										
		document.querySelector('#winCol0').style.display = 'none';					
		document.querySelector('#winCol1').style.display = 'none';										
		document.querySelector('#winCol2').style.display = 'none';															
		document.querySelector('#winDia1').style.display = 'none';					
		document.querySelector('#winDia2').style.display = 'none';
	}
};


var model = { //модель игры
	
	boardSize: 3, //размер игрового поля
	
	gameOver: false, // игра окончена?

	moves: 0, // количество ходов

	rounds: 0, // количество партий

	playerScore: 0, // количество побед игрока

	AIScore: 0, // количество побед противника

	currentPlayer: null, // символ игрока (х или о)

	currentAI: null, // символ противника

	playerTurn: function(location){ //ход игрока
		hit(location, model.currentPlayer);
		this.closedCells.push(location);
		this.moves++;
		for (var i = 0; i < (this.boardSize * 2 + 2); i++){//проверка на комбинацию из трех Х
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === model.currentPlayer;})){
				view.displayMessage('Вы выиграли!');
				this.playerScore++;
				this.rounds++;
				view.displayStat();
				this.gameOver = true;
				view.displayLine(winLine.name);
			} 
		}
		this.nextTurn(controller.AIMove);
	},
	
	AITurn: function(location){ //ход противника, компьютера
		hit(location, model.currentAI);
		this.closedCells.push(location);
		this.moves++;
		for (var i = 0; i < (this.boardSize * 2 + 2); i++){//проверка на комбинацию из трех О
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === model.currentAI;})){
				view.displayMessage('Вы проиграли!');
				this.AIScore++;
				this.rounds++;
				view.displayStat();
				this.gameOver = true;
				view.displayLine(winLine.name);
			} 
		}
		this.nextTurn(controller.playerMove);
	},
	
	nextTurn: function (nextPlayer) { //передача хода
 		shuffle(model.cells);
 		if (!this.gameOver && this.moves < (this.boardSize * this.boardSize)){
			nextPlayer();
		} else if (!this.gameOver && this.moves == (this.boardSize * this.boardSize)) {
			view.displayMessage('Ничья!');
			this.rounds++;
			view.displayStat();
			this.gameOver = true;
		} else {
			return false;
		}
	},

	closedCells: [], // ячейки, в которых сделаны ходы: нужен для предотвращения повторного хода
	
	cells: [ //строки, столбцы и диагонали, в которых производятся действия
		{name: 'row0', locations: ['00', '01', '02'], hits: ['', '', '',], toWinX: 0}, // locations - координаты
		{name: 'row1', locations: ['10', '11', '12'], hits: ['', '', '',], toWinX: 0}, // ячеек по строкам, 
		{name: 'row2', locations: ['20', '21', '22'], hits: ['', '', '',], toWinX: 0}, // столбцам и диагоналям; 
		{name: 'col0', locations: ['00', '10', '20'], hits: ['', '', '',], toWinX: 0}, // hits - отмечать ячейки
		{name: 'col1', locations: ['01', '11', '21'], hits: ['', '', '',], toWinX: 0}, // попаданий х и о;
		{name: 'col2', locations: ['02', '12', '22'], hits: ['', '', '',], toWinX: 0}, // toWinX - ближе/дальше к
		{name: 'dia1', locations: ['00', '11', '22'], hits: ['', '', '',], toWinX: 0}, // победе;
		{name: 'dia2', locations: ['02', '11', '20'], hits: ['', '', '',], toWinX: 0},
		]
};


var controller = { //контроллер
	
	playerMove: function(location){ //прием хода игрока
		if (location) {
			parseMove(location);
		}	
	},
	
	AIMove: function(){ //прием хода компьютера и логика ходов
		var row;
		var col;
		var location;
		if (model.moves <= 1){ // для первого хода генерируется случайная позиция
			row = Math.floor(Math.random() * model.boardSize);
			col = Math.floor(Math.random() * model.boardSize);
			location = row + '' + col;
		} else { //определение позиции в соответствии с приоритетом
			var winLineToWinO = model.cells.find(item => item.toWinX == 0 - 
				(model.boardSize - 1));
			var winLineToWinX = model.cells.find(item => item.toWinX == 0 + 
				(model.boardSize - 1));
			var winLineCloseToWinO = model.cells.find(item => item.toWinX == 0 - 
				(model.boardSize - 2) && item.hits.includes(''));
			var winLineCloseToWinX = model.cells.find(item => item.toWinX == 0 + 
				(model.boardSize - 2) && item.hits.includes(''));			
			if (winLineToWinO){
	 			index = winLineToWinO.hits.indexOf('');
				location = winLineToWinO.locations[index];
			} else if (winLineToWinX){
	 			index = winLineToWinX.hits.indexOf('');
				location = winLineToWinX.locations[index];
			} else if (winLineCloseToWinO){
	 			index = winLineCloseToWinO.hits.indexOf('');
				location = winLineCloseToWinO.locations[index];
			} else if (winLineCloseToWinX){
	 			index = winLineCloseToWinX.hits.indexOf('');
				location = winLineCloseToWinX.locations[index];
			} else {
				do {
					row = Math.floor(Math.random() * model.boardSize);
					col = Math.floor(Math.random() * model.boardSize);
					location = row + '' + col;
				} while (model.closedCells.indexOf(location) >= 0);
				console.log('random move'); //для большего поля нужна случайная генерация позиции  
			}
		}
		parseAIMove(location);
	}
};


function parseMove(location){ //валидатор хода игрока
	if ((model.closedCells.indexOf(location) < 0) && (!model.gameOver)){
		model.playerTurn(location);
	} else {
		return false;
	}
}


function parseAIMove(location){ //валидатор хода компьютера
	if ((model.closedCells.indexOf(location) < 0) && (!model.gameOver)){
		model.AITurn(location);
	} else {
		controller.AIMove();
	}  
}

function shuffle (arr){ // перемешивание позиций элементов в массиве случайным образом
	var j, temp;
	for (var i = arr.length - 1; i > 0; i--){
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp;
	}
	return arr;
}

function init(){ //инициализация игры (стартового экрана)
	document.getElementById('buttonX').onclick = function(){start('x')}; 
	document.getElementById('buttonO').onclick = function(){start('o')};
	document.getElementById('newGameButton').onclick = newGame;
	document.getElementById('continueGameButton').onclick = continueGame;
	view.displayStat();	
}

function setGrid(){ // генерация координат ячеек и установка слушателя для кликов игрока
	for (var i = 0; i < model.boardSize; i++){
		var row = i.toString();
		for (var j = 0; j < model.boardSize; j++){
			var col = j.toString();
			var idBoard = row + col;
			const location = idBoard;
			document.getElementById(idBoard).addEventListener('click', function (e){
				if (document.querySelector('#window').style.display === 'none'){
					controller.playerMove(location);
				}
			});
		}
	} 	
}

function start (sym){ // старт игры
	document.querySelector('#window').style.display = 'none';
	document.querySelector('#newGameButton').style.display = 'block';
	document.querySelector('#continueGameButton').style.display = 'block';	
	setGrid();
	view.displayStat();
	view.displayMessage('Ваш ход!')
	if (sym === 'x'){
		model.currentPlayer = 'x';
		model.currentAI = 'o';
	} else {
		model.currentPlayer = 'o';
		model.currentAI = 'x';
		controller.AIMove();
	}
};

function newGame(){ // создание новой игры
	clearBoard();
	model.rounds = 0;
	model.playerScore = 0;
	model.AIScore = 0;
	model.currentPlayer = null;
	model.currentAI = null;
	document.querySelector('#window').style.display = 'block';
	document.querySelector('#newGameButton').style.display = 'none';
	document.querySelector('#continueGameButton').style.display = 'none';	
	view.displayMessage('Крестики-нолики');
	view.displayStat();
}

function hit(location, sym){ //функция записи хода игрока в соответствующую ячейку
	for (var i = 0; i < (model.boardSize * 2 + 2); i++){ //поиск и отметка хода в нужных cells.hits
		var winLine = model.cells[i];
		var index = winLine.locations.indexOf(location);
		if (index >= 0){
			winLine.hits[index] = sym;
			if (sym === model.currentPlayer){
				winLine.toWinX++; //чем больше, тем ближе к победе Х
				if (model.currentPlayer === 'x'){
					view.displaySym(location, sym);
				} else {
					view.displaySym(location, sym);
				}
			} else {
				winLine.toWinX--;
				if (model.currentAI === 'o'){
					view.displaySym(location, sym);
				} else {
					view.displaySym(location, sym);
				}
			}
		}
	}
}

function clearBoard(){ // очистка поля и статистики текущей партии
		for (var i = 0; i < model.boardSize; i++){
			var row = i.toString();
			for (var j = 0; j < model.boardSize; j++){
				var col = j.toString();
				var idBoard = row + col;
				const location = idBoard;
				document.getElementById(idBoard).classList.remove('x', 'o');
			}
		}
		view.removeLine();
		model.gameOver = false;
		model.moves = 0;
		model.closedCells = [];
		for (var i = 0; i < model.cells.length; i++){
			var winLine = model.cells[i];
			winLine.toWinX = 0;
			for (var j = 0; j < model.boardSize; j++){
				winLine.hits[j] = '';
			}
		}	
}

function continueGame(){ // начало новой партии текущей игры
	if (model.gameOver === true){
		clearBoard();
		view.displayMessage('Ваш ход!');
		if (model.currentPlayer === 'o'){
			controller.AIMove();
		}
	}
}

window.onload = init;