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
	
	displayX: function (location){ //вывод ходов Х
		document.getElementById(location).setAttribute('class', 'x');
	},
	
	displayO: function (location){ // вывод ходов О
		document.getElementById(location).setAttribute('class', 'o');
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
					for (var j = 0; j < winLine.hits.length; j++){
						if (winLine.hits[j] === ''){
							var cellId = winLine.locations[j];
							this.closedCells.push(cellId);
						}
					}
			} 
		}
		this.nextMove(controller.AIMove);
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
					for (var j = 0; j < winLine.hits.length; j++){
						if (winLine.hits[j] === ''){
							var cellId = winLine.locations[j];
							this.closedCells.push(cellId);
						}
					}
			} 
		}
		this.nextMove(controller.playerMove);
	},
	
	nextMove: function (nextPlayer) { //передача хода
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
		{locations: ['00', '01', '02'], hits: ['', '', '',], toWinX: 0}, // locations - координаты
		{locations: ['10', '11', '12'], hits: ['', '', '',], toWinX: 0}, // ячеек по строкам, 
		{locations: ['20', '21', '22'], hits: ['', '', '',], toWinX: 0}, // столбцам и диагоналям; 
		{locations: ['00', '10', '20'], hits: ['', '', '',], toWinX: 0}, // hits - отмечать ячейки
		{locations: ['01', '11', '21'], hits: ['', '', '',], toWinX: 0}, // попаданий х и о;
		{locations: ['02', '12', '22'], hits: ['', '', '',], toWinX: 0}, // toWinX - ближе/дальше к
		{locations: ['00', '11', '22'], hits: ['', '', '',], toWinX: 0}, // победе;
		{locations: ['02', '11', '20'], hits: ['', '', '',], toWinX: 0},
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
			parseAIMove(location);
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
				parseAIMove(location);
			} else if (winLineToWinX){
	 			index = winLineToWinX.hits.indexOf('');
				location = winLineToWinX.locations[index];
				parseAIMove(location);				
			} else if (winLineCloseToWinO){
	 			index = winLineCloseToWinO.hits.indexOf('');
				location = winLineCloseToWinO.locations[index];
				parseAIMove(location);				
			} else if (winLineCloseToWinX){
	 			index = winLineCloseToWinX.hits.indexOf('');
				location = winLineCloseToWinX.locations[index];
				parseAIMove(location);								
			} else {
				do {
					row = Math.floor(Math.random() * model.boardSize);
					col = Math.floor(Math.random() * model.boardSize);
					location = row + '' + col;
				} while (model.closedCells.indexOf(location) >= 0);
				parseAIMove(location);					
				console.log('i dont know'); //для большего поля нужна случайная генерация позиции  
			}
			}
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

function init(){ //инициализация игры
	document.getElementById('buttonX').onclick = startX; 
	document.getElementById('buttonO').onclick = startO;
	document.getElementById('newGameButton').onclick = reload;
	document.getElementById('continueGameButton').onclick = newGame;	
}

function setGrid(){ // генерация координат ячеек и установка слушателя для кликов игрока
	for (var i = 0; i < model.boardSize; i++){
		var row = i.toString();
		for (var j = 0; j < model.boardSize; j++){
			var col = j.toString();
			var idBoard = row + col;
			const location = idBoard;
			document.getElementById(idBoard).addEventListener('click', function (e){
				controller.playerMove(location);
			});
		}
	} 	
}

function startX (){ // инициализация игры за х
	document.querySelector('#window').style.display = 'none';
	document.querySelector('#newGameButton').style.display = 'block';
	document.querySelector('#continueGameButton').style.display = 'block';	
	model.currentPlayer = 'x';
	model.currentAI = 'o';
	setGrid();
	view.displayStat();
	view.displayMessage('Ваш ход!')
};

function startO (){ // инициализация игры за о
	document.querySelector('#window').style.display = 'none';
	document.querySelector('#newGameButton').style.display = 'block';
	document.querySelector('#continueGameButton').style.display = 'block';		
	model.currentPlayer = 'o';
	model.currentAI = 'x';
	setGrid();
	view.displayStat();
	controller.AIMove();
	view.displayMessage('Ваш ход!')
};

function reload(){ // перезагрузка для новой игры
	window.location.reload();
}

function hit(location, sym){ //функция записи хода игрока в соответствующую ячейку
	for (var i = 0; i < (model.boardSize * 2 + 2); i++){
		var winLine = model.cells[i];
		var index = winLine.locations.indexOf(location);
		if (index >= 0){
			winLine.hits[index] = sym;
			if (sym === model.currentPlayer){
				winLine.toWinX++; //чем больше, тем ближе к победе Х
				if (model.currentPlayer === 'x'){
					view.displayX(location);
				} else {
					view.displayO(location);
				}
			} else {
				winLine.toWinX--;
				if (model.currentAI === 'o'){
					view.displayO(location);
				} else {
					view.displayX(location);
				}
			}
		}
	}
}


function newGame(){ // очистка поля и начало новой партии текущей игры
	if (model.gameOver === true){
		for (var i = 0; i < model.boardSize; i++){
			var row = i.toString();
			for (var j = 0; j < model.boardSize; j++){
				var col = j.toString();
				var idBoard = row + col;
				const location = idBoard;
				document.getElementById(idBoard).classList.remove('x', 'o');
			}
		}
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
		view.displayMessage('Ваш ход!');
		if (model.currentPlayer === 'o'){
			controller.AIMove();
		}
	}
}

window.onload = init;