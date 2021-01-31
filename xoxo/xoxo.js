var view = { //визуальное представление
	
	displayMessage: function (msg){ //вывод сообщений
		document.getElementById('messageArea').innerHTML = msg;
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
	
	gameOver: false,

	moves: 0,

	playerTurn: function(location){ //ход игрока
		hit(location, 'x');
		this.closedCells.push(location);
		view.displayX(location);
		this.moves++;
		for (var i = 0; i < (this.boardSize * 2 + 2); i++){//проверка на комбинацию из трех Х
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === 'x'})){
				view.displayMessage('Вы выиграли!');
				this.gameOver = true;
				setTimeout(newGame, 500);
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
		hit(location, 'o');
		this.closedCells.push(location);
		view.displayO(location);
		this.moves++;
		for (var i = 0; i < (this.boardSize * 2 + 2); i++){//проверка на комбинацию из трех О
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === 'o'})){
				view.displayMessage('Вы проиграли!');
				this.gameOver = true;
				setTimeout(newGame, 500);
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
 		if (!this.gameOver && this.moves < (this.boardSize * this.boardSize)){
			nextPlayer();
		} else if (!this.gameOver && this.moves == (this.boardSize * this.boardSize)) {
			view.displayMessage('Ничья!');
			setTimeout(newGame, 500);			
		} else {
			return false;
		}
	},

	closedCells: [], //массив ячеек, в которых сделаны ходы: нужен для предотвращения повторного хода
	
	cells: [ //строки, столбцы и диагонали, в которых производятся действия
		{locations: ['00', '01', '02'], hits: ['', '', '',], toWinX: 0},
		{locations: ['10', '11', '12'], hits: ['', '', '',], toWinX: 0},
		{locations: ['20', '21', '22'], hits: ['', '', '',], toWinX: 0},
		{locations: ['00', '10', '20'], hits: ['', '', '',], toWinX: 0},
		{locations: ['01', '11', '21'], hits: ['', '', '',], toWinX: 0},
		{locations: ['02', '12', '22'], hits: ['', '', '',], toWinX: 0},
		{locations: ['00', '11', '22'], hits: ['', '', '',], toWinX: 0},
		{locations: ['02', '11', '20'], hits: ['', '', '',], toWinX: 0},
		]
};


var controller = { //контроллер
	
	playerMove: function(location){ //прием хода игрока
		if (location) {
			parseMove(location);
		}	
	},
	
	AIMove: function(){ //прием хода компьютера
		var row;
		var col;
		var location;
		if (model.moves <= 1){ // для первого хода генерируется случайная позиция
			row = Math.floor(Math.random() * model.boardSize);
			col = Math.floor(Math.random() * model.boardSize);
			location = row + '' + col;
			parseAIMove(location);
		} else { //определение позиции в соответствии с приоритетом
			var winLineToWinO = model.cells.find(item => item.toWinX == 0 - (model.boardSize - 1));
			var winLineToWinX = model.cells.find(item => item.toWinX == 0 + (model.boardSize - 1));
			var winLineCloseToWinO = model.cells.find(item => item.toWinX == 0 - (model.boardSize - 2) && item.hits.includes(''));
			var winLineCloseToWinX = model.cells.find(item => item.toWinX == 0 + (model.boardSize - 2) && item.hits.includes(''));			
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
				console.log('i dont know'); //для большего поля нужна будет случайная генерация позиции 
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


function init(){ //инициализация игры
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


function hit(location, sym){ //функция записи хода игрока в соответствующую ячейку
	for (var i = 0; i < (model.boardSize * 2 + 2); i++){
		var winLine = model.cells[i];
		var index = winLine.locations.indexOf(location);
		if (index >= 0){
			winLine.hits[index] = sym;
			if (sym === 'x'){
				winLine.toWinX++; //чем больше, тем ближе к победе Х
			} else {
				winLine.toWinX--;
			}
		}
	}
}


function newGame(){
	if (confirm('Сыграем еще раз?')){
		window.location.reload();
	}
}

window.onload = init;