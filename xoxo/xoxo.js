var view = { //визуальное представление
	
	displayMessage: function (msg){ //вывод сообщений
		var messageArea = document.getElementById('messageArea');
		messageArea.innerHTML = msg;
	},
	
	displayX: function (location){ //вывод ходов Х
		var cell = document.getElementById(location);
		cell.setAttribute('class', 'x');
	},
	
	displayO: function (location){ // вывод ходов О
		var cell = document.getElementById(location);
		cell.setAttribute('class', 'o');
	}
};


var model = { //модель игры
	
	boardSize: 3, //размер игрового поля
	
	playerTurn: function(location){ //ход игрока
		hit(location, 'x');
		this.closedCells.push(location);
		view.displayX(location);
		for (var i = 0; i < this.boardSize * 2 + 2; i++){
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === 'x'})){
				view.displayMessage('Вы выиграли!');
				for (var i = 0; i < model.boardSize * 2 + 2; i++){
					var winLine = model.cells[i];
					for (var j = 0; j < winLine.hits.length; j++){
						if (winLine.hits[j] === ''){
							var cellId = winLine.locations[j];
							this.closedCells.push(cellId);
						}
					}
				}
			} 
		}
		controller.AIMove();
	},
	
	AITurn: function(location){ //ход противника, компьютера
		hit(location, 'o');
		this.closedCells.push(location);
		view.displayO(location);
		for (var i = 0; i < this.boardSize * 2 + 2; i++){
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === 'o'})){
				view.displayMessage('Вы проиграли!');
				for (var i = 0; i < model.boardSize * 2 + 2; i++){
					var winLine = model.cells[i];
					for (var j = 0; j < winLine.hits.length; j++){
						if (winLine.hits[j] === ''){
							var cellId = winLine.locations[j];
							this.closedCells.push(cellId);
						}
					}
				}
			} 
		}	
	},
	
	closedCells: [], //массив ячеек, в которых сделаны ходы
	
	cells: [ //строки, столбцы и диагонали, в которых производятся действия
		{locations: ['00', '01', '02'], hits: ['', '', '',]},
		{locations: ['10', '11', '12'], hits: ['', '', '',]},
		{locations: ['20', '21', '22'], hits: ['', '', '',]},
		{locations: ['00', '10', '20'], hits: ['', '', '',]},
		{locations: ['01', '11', '21'], hits: ['', '', '',]},
		{locations: ['02', '12', '22'], hits: ['', '', '',]},
		{locations: ['00', '11', '22'], hits: ['', '', '',]},
		{locations: ['02', '11', '20'], hits: ['', '', '',]},
		]
};


var controller = { //контроллер
	
	playerMove: function(location){ //прием хода игрока
		parseMove(location);
	},
	
	AIMove: function(){ //прием хода компьютера
		var row = Math.floor(Math.random() * model.boardSize);
		var col = Math.floor(Math.random() * model.boardSize);
		var location = row + '' + col;
		parseMoveAI(location);
		}
};


function parseMove(location){ //валидатор хода игрока
	if (model.closedCells.indexOf(location) < 0){
		model.playerTurn(location);
	} else {
		return false;
	}
}


function parseMoveAI(location){ //валидатор хода компьютера
	if (model.closedCells.indexOf(location) < 0){
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


function hit(location, sym){ //функция записи хода конкретного игрока в соответствующую ячейку
	for (var i = 0; i < model.boardSize * 2 + 2; i++){
		var winLine = model.cells[i];
		var index = winLine.locations.indexOf(location);
			if (index >= 0){
				winLine.hits[index] = sym;
			}
	}
}

window.onload = init;