var view = { //визуальное представление
	
	displayMessage: function (msg){ //вывод сообщений
		show(msg);
		// document.getElementById('messageArea').innerHTML = msg;
		if (msg === 'Вы выиграли!'){
			document.querySelector('#messageArea').style.color = '#42A61F';
		} else if (msg === 'Вы проиграли!'){
			document.querySelector('#messageArea').style.color = '#FF0000';
		} else {
			document.querySelector('#messageArea').style.color = '#1371C8';
		}
	},

	displayStat: function (){ //вывод счета и количества сыгранных партий
		document.getElementById('statArea').innerHTML = 'Счет ' + model.playerScore + ' : ' 
			+ model.AIScore + '<br>' + ' Сыграно партий: ' + model.rounds;
	},
	
	displaySym: function (location, sym){ //вывод ходов
		document.getElementById(location).setAttribute('class', sym);
		if (sym === 'x'){
			playSound(xSound);
		} else {
			playSound(oSound);
		}
	},	

	displayLine: function (name){ // вывод линии трех подряд символов
		document.getElementById('winLine').style.display = 'block';
		document.getElementById('winLine').setAttribute('class', name);				
	},

	removeLine: function (){ // стереть победную линию
		document.getElementById('winLine').classList = [];
		document.getElementById('winLine').style.display = 'none';		
	},

	displayStarScore: function (){
		document.getElementById('starScore').innerHTML = model.starScore;
	}
};

function show (msg){ // анимация строки сообщения
	var letters = msg.split('');
	var liveStr = ''
	for (let i = 0; i < letters.length; i++){
   		setTimeout(function(){liveStr = liveStr + letters[i];
		document.getElementById('messageArea').innerHTML = liveStr;}, i*20);
   }
}

var model = { //модель игры
	
	boardSize: 3, //размер игрового поля
	
	gameOver: false, // игра окончена?

	moves: 0, // количество ходов

	rounds: 0, // количество партий

	playerScore: 0, // количество побед игрока

	AIScore: 0, // количество побед противника

	currentPlayer: null, // символ игрока (х или о)

	currentAI: null, // символ противника

	currentMove: null, // текущий ход

	currentStarLocation: null, // текущее положение звезды

	starScore: 0,

	playerTurn: function(location){ //ход игрока
		hit(location, model.currentPlayer);
		this.closedCells.push(location);
		this.moves++;
		for (var i = 0; i < (this.boardSize * 2 + 2); i++){//проверка на комбинацию из трех Х
			var winLine = this.cells[i];
			if (winLine.hits.every(function (hit){return hit === model.currentPlayer;})){
				view.displayMessage('Вы выиграли!');
				playSound(winSound);
				this.playerScore++;
				this.rounds++;
				view.displayStat();
				this.gameOver = true;
				view.displayLine(winLine.name);
				if (winLine.locations.indexOf(model.currentStarLocation) >= 0){
					this.starScore++;
					view.displayStarScore();
					document.getElementById('star').src = 'winStar.png';
					document.getElementById('star').setAttribute('class', 'winStar');					
				} 
			}
		}
		if (!this.gameOver && this.moves < (this.boardSize * this.boardSize)){
			view.displayMessage('Ход противника!');
			this.currentMove = this.currentAI;
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
				playSound(failSound);
				this.AIScore++;
				this.rounds++;
				view.displayStat();
				this.gameOver = true;
				view.displayLine(winLine.name);
				if (winLine.locations.indexOf(model.currentStarLocation) >= 0){
					if (this.starScore > 0){
						this.starScore--;
						view.displayStarScore();
					}
				} 
			}
		}
		if (!this.gameOver && this.moves < (this.boardSize * this.boardSize)){
			view.displayMessage('Ваш ход!');
			this.currentMove = this.currentPlayer;
		}
		this.nextTurn(controller.playerMove);
	},
	
	nextTurn: function (nextPlayer) { //передача хода
 		shuffle(model.cells);
 		if (!this.gameOver && this.moves < (this.boardSize * this.boardSize)){
			setTimeout(function(){nextPlayer();}, 750); // длительность передачи хода (по факту - время на ход компьютера)
		} else if (!this.gameOver && this.moves == (this.boardSize * this.boardSize)) {
			view.displayMessage('Ничья!');
			playSound(gameOverSound);
			this.rounds++;
			view.displayStat();
			this.gameOver = true;
		} else {
			return false;
		}
	},

	closedCells: [], // ячейки, в которых сделаны ходы: нужен для предотвращения повторного хода
	
	cells: [ //строки, столбцы и диагонали, в которых производятся действия
		{name: 'row0', locations: ['00', '01', '02'], hits: ['', '', '',], toWinP: 0}, // locations - координаты
		{name: 'row1', locations: ['10', '11', '12'], hits: ['', '', '',], toWinP: 0}, // ячеек по строкам, 
		{name: 'row2', locations: ['20', '21', '22'], hits: ['', '', '',], toWinP: 0}, // столбцам и диагоналям; 
		{name: 'col0', locations: ['00', '10', '20'], hits: ['', '', '',], toWinP: 0}, // hits - отмечать ячейки
		{name: 'col1', locations: ['01', '11', '21'], hits: ['', '', '',], toWinP: 0}, // попаданий х и о;
		{name: 'col2', locations: ['02', '12', '22'], hits: ['', '', '',], toWinP: 0}, // toWinP - ближе/дальше к
		{name: 'dia1', locations: ['00', '11', '22'], hits: ['', '', '',], toWinP: 0}, // победе игрока;
		{name: 'dia2', locations: ['02', '11', '20'], hits: ['', '', '',], toWinP: 0}, // name - для вывода winLine
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
			var winLineToWinO = model.cells.find(item => item.toWinP == 0 - 
				(model.boardSize - 1));
			var winLineToWinP = model.cells.find(item => item.toWinP == 0 + 
				(model.boardSize - 1));
			var winLineCloseToWinO = model.cells.find(item => item.toWinP == 0 - 
				(model.boardSize - 2) && item.hits.includes(''));
			var winLineCloseToWinP = model.cells.find(item => item.toWinP == 0 + 
				(model.boardSize - 2) && item.hits.includes(''));			
			if (winLineToWinO){
	 			index = winLineToWinO.hits.indexOf('');
				location = winLineToWinO.locations[index];
			} else if (winLineToWinP){
	 			index = winLineToWinP.hits.indexOf('');
				location = winLineToWinP.locations[index];
			} else if (winLineCloseToWinO){
	 			index = winLineCloseToWinO.hits.indexOf('');
				location = winLineCloseToWinO.locations[index];
			} else if (winLineCloseToWinP){
	 			index = winLineCloseToWinP.hits.indexOf('');
				location = winLineCloseToWinP.locations[index];
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
		view.displayMessage('Ячейка занята!');
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
	document.getElementById('buttonX').onclick = function(){
		start('x'); 
		playSound(clickSound);
	}; 
	document.getElementById('buttonO').onclick = function(){
		start('o'); 
		playSound(clickSound);
	};
	document.getElementById('newGameButton').onclick = function(){
		newGame(); 
		playSound(clockSound);
	}; 
	document.getElementById('continueGameButton').onclick = function(){
		continueGame(); 
		playSound(clockSound);
	};
	document.getElementById('soundMode').onclick = function(){
		changeVolume(); 
		playSound(clockSound);
	};
	// document.querySelectorAll('.sounds').forEach(function(item){item.volume = 0});	
	document.getElementById('colorMode').onclick = function(){
		changeColorScheme(); 
		playSound(clockSound);

	};
	view.displayStat();	
}

function changeColorScheme(){ // смена стиля экрана (светлый\темный)
	if (document.getElementById('colorMode').classList.contains('lightMode')){
		document.getElementById('colorMode').setAttribute('class', 'darkMode');
		document.body.setAttribute('class', 'darkBody');
		document.getElementById('window').setAttribute('class', 'darkWindow');
	} else {
		document.getElementById('colorMode').setAttribute('class', 'lightMode');
		document.body.setAttribute('class', 'lightBody');
		document.getElementById('window').setAttribute('class', 'lightWindow');
	}
}

function changeVolume(){ // смена режима воспроизведения звука
	if (document.getElementById('soundMode').classList.contains('sound')){
		document.getElementById('soundMode').setAttribute('class', 'mute');
	} else {
		document.getElementById('soundMode').setAttribute('class', 'sound');
	}
}

function setGrid(){ // генерация координат ячеек и установка слушателя для кликов игрока
	for (var i = 0; i < model.boardSize; i++){
		var row = i.toString();
		for (var j = 0; j < model.boardSize; j++){
			var col = j.toString();
			var idBoard = row + col;
			const location = idBoard;
			document.getElementById(idBoard).addEventListener('click', function (e){
				if (document.querySelector('#window').style.display === 'none' && 
					model.currentMove !== model.currentAI && !model.gameOver){
					controller.playerMove(location);
				}
			});
		}
	}
	setStar(); 	
}

function start (sym){ // старт игры
	document.querySelector('#window').style.display = 'none';
	document.querySelector('#newGameButton').style.display = 'block';
	document.querySelector('#continueGameButton').style.display = 'block';
	setGrid();
	view.displayStat();
	if (sym === 'x'){
		model.currentPlayer = 'x';
		model.currentAI = 'o';
		view.displayMessage('Ваш ход!');
		model.currentMove = model.currentPlayer;
	} else {
		model.currentPlayer = 'o';
		model.currentAI = 'x';
		setTimeout(function(){controller.AIMove();}, 750);
		view.displayMessage('Ход противника!');
		model.currentMove = model.currentAI;
	}
};

function setStar (){
	var row = Math.floor(Math.random() * model.boardSize);
	var col = Math.floor(Math.random() * model.boardSize);
	var location = row + '' + col;
	var star = document.createElement('img');
	star.src = 'star.png';
	star.id = 'star';
	document.getElementById(location).append(star);
	model.currentStarLocation = location;	
}

function removeStar(){
	document.getElementById('star').remove();
	model.currentStarLocation = null;
}

function newGame(){ // создание новой игры
	setTimeout(function(){view.displayMessage('Крестики-нолики');}, 300);
	clearBoard();
	model.rounds = 0;
	model.playerScore = 0;
	model.AIScore = 0;
	model.currentPlayer = null;
	model.currentAI = null;
	model.currentMove = null;
	document.querySelector('#window').style.display = 'block';
	document.querySelector('#newGameButton').style.display = 'none';
	document.querySelector('#continueGameButton').style.display = 'none';
	view.displayStat(); 
}

function hit(location, sym){ //функция записи хода игрока в соответствующую ячейку
	for (var i = 0; i < (model.boardSize * 2 + 2); i++){ //поиск и отметка хода в нужных cells.hits
		var winLine = model.cells[i];
		var index = winLine.locations.indexOf(location);
		if (index >= 0){
			winLine.hits[index] = sym;
			if (sym === model.currentPlayer){
				winLine.toWinP++; //чем больше, тем ближе к победе
				if (model.currentPlayer === 'x'){
					view.displaySym(location, sym);
				} else {
					view.displaySym(location, sym);
				}
			} else {
				winLine.toWinP--;
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
				document.getElementById(idBoard).classList.remove('x', 'o');
			}
		}
		view.removeLine();
		model.gameOver = false;
		model.moves = 0;
		model.closedCells = [];
		for (var i = 0; i < model.cells.length; i++){
			var winLine = model.cells[i];
			winLine.toWinP = 0;
			for (var j = 0; j < model.boardSize; j++){
				winLine.hits[j] = '';
			}
		}
		removeStar();	
}

function continueGame(){ // начало новой партии текущей игры
	if (model.gameOver === true){
		clearBoard();
		setStar();
		if (model.currentPlayer === 'x'){
			view.displayMessage('Ваш ход!');
			model.currentMove = model.currentPlayer;
		} else {
			setTimeout(function(){controller.AIMove();}, 750);
			view.displayMessage('Ход противника!');
			model.currentMove = model.currentAI;
		}
	}
}

var clickSound = new Audio('click.wav');
clickSound.preload = 'auto';

var clockSound = new Audio('clock.wav');
clockSound.preload = 'auto';

var xSound = new Audio('x.wav');
xSound.preload = 'auto';

var oSound = new Audio('o.wav');
oSound.preload = 'auto';

var winSound = new Audio('win.wav');
winSound.preload = 'auto';

var failSound = new Audio('fail.wav');
failSound.preload = 'auto';

var gameOverSound = new Audio('gameOver.wav');
gameOverSound.preload = 'auto';

function playSound(sound){
	if (document.getElementById('soundMode').classList.contains('sound')){
		sound.play();
	} else {
		return false;
	}
}

window.onload = init;