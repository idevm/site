var view = { //визуальное представление
	
	displayMessage: function (msg){ //вывод сообщений
		show(msg);
		if (msg === 'Вы выиграли!'){
			document.querySelector('#messageArea').style.color = '#42A61F';
		} else if (msg === 'Вы проиграли!'){
			document.querySelector('#messageArea').style.color = '#FF0000';
		} else {
			document.querySelector('#messageArea').style.color = '#1371C8';
		}
	},

	displayStat: function (){ //вывод счета и количества сыгранных партий
		document.getElementById('statArea').innerHTML = 'Счет ' + model.playerScore + 
		' : ' + model.AIScore + '<br>' + 'Сыграно партий: ' + model.rounds;
	},
	
	displaySym: function (location, sym){ //вывод ходов
		document.getElementById(location).setAttribute('class', sym);
		sym === 'x' ? playSound(xSound) : playSound(oSound);
	},	

	displayLine: function (name){ // вывод линии трех подряд символов
		document.getElementById('winLine').style.display = 'block';
		document.getElementById('winLine').setAttribute('class', name);				
	},

	removeLine: function (){ // стереть победную линию
		document.getElementById('winLine').classList = [];
		document.getElementById('winLine').style.display = 'none';		
	},

	displayStarScore: function (){ // показ количества звезд
		document.getElementById('starScore').innerHTML = model.starScore;
	}
};

function show (msg){ // анимация строки сообщения
	let letters = msg.split('');
	let liveStr = '';
	for (let i = 0; i < letters.length; i++){
   		setTimeout(function(){
   			liveStr += letters[i];
			document.getElementById('messageArea').innerHTML = liveStr;
		}, i*20);
   }
}

var model = { //модель и состояние игры
	
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

	starScore: 0, // количество звезд игрока

	freeCells: [], // свободные ячейки, в которые можно делать ход
	
	cells: [	
		{name: 'row0', locations: ['00', '01', '02'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'row1', locations: ['10', '11', '12'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'row2', locations: ['20', '21', '22'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'col0', locations: ['00', '10', '20'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'col1', locations: ['01', '11', '21'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'col2', locations: ['02', '12', '22'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'dia1', locations: ['00', '11', '22'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'dia2', locations: ['02', '11', '20'], hits: ['', '', '',], toWinP: 0}, 
	],
			// cells[] - строки, столбцы и диагонали, в которых производятся действия
			// name - для вывода соответствующей winLine
			// locations - координаты ячеек по строкам, столбцам и диагоналям;
			// hits - отмечать ячейки попаданий х и о
			// toWinP - ближе/дальше к победе игрока
	
	playerTurn: function(location){ //ход игрока
		hit(location, model.currentPlayer);
		let index = this.freeCells.indexOf(location);
		this.freeCells.splice(index, 1);
		this.moves++;
		for (let i = 0; i < this.boardSize * 2 + 2; i++){//проверка на комбинацию из трех Х
			let winLine = this.cells[i];
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
		if (!this.gameOver && this.moves < this.boardSize * this.boardSize){
			view.displayMessage('Ход противника!');
			this.currentMove = this.currentAI;
		}
		this.nextTurn(controller.AIMove);
	},
	
	AITurn: function(location){ //ход противника, компьютера
		hit(location, model.currentAI);
		let index = this.freeCells.indexOf(location);
		this.freeCells.splice(index, 1);
		this.moves++;
		for (let i = 0; i < this.boardSize * 2 + 2; i++){//проверка на комбинацию из трех О
			let winLine = this.cells[i];
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
					document.getElementById('star').src = 'failStar.png';
					document.getElementById('star').setAttribute('class', 'failStar');
				} 
			}
		}
		if (!this.gameOver && this.moves < this.boardSize * this.boardSize){
			view.displayMessage('Ваш ход!');
			this.currentMove = this.currentPlayer;
		}
		this.nextTurn(controller.playerMove);
	},
	
	nextTurn: function (nextPlayer) { //передача хода
 		shuffle(model.cells);
 		if (!this.gameOver && this.moves < this.boardSize * this.boardSize){
			setTimeout(function(){ // длительность передачи хода (по факту - время на ход компьютера)
				nextPlayer();
			}, 750); 
		} else if (!this.gameOver && this.moves === this.boardSize * this.boardSize) {
			view.displayMessage('Ничья!');
			playSound(gameOverSound);
			this.rounds++;
			view.displayStat();
			this.gameOver = true;
		} else {
			return false;
		}
	}
};

function hit(location, sym){ //функция записи хода игрока в соответствующую ячейку
	for (let i = 0; i < model.boardSize * 2 + 2; i++){ //поиск и отметка хода в нужных cells.hits
		let winLine = model.cells[i];
		let index = winLine.locations.indexOf(location);
		if (index >= 0){
			winLine.hits[index] = sym;
			view.displaySym(location, sym);
			sym === model.currentPlayer ? winLine.toWinP++ : winLine.toWinP--;
		}
	}
}

function shuffle (arr){ // перемешивание позиций элементов в массиве случайным образом
	let j, temp;
	for (let i = arr.length - 1; i > 0; i--){
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp;
	}
	return arr;
}

var controller = { //контроллер
	
	playerMove: function(location){ //прием хода игрока
		location ? parseMove(location) : false;
	},
	
	AIMove: function(){ //прием хода компьютера и логика ходов
		let location;
		if (model.moves <= 1){
			location = randomLocation();
		} else { //определение позиции в соответствии с приоритетом
			let winLineToWinAI = model.cells.find(item => item.toWinP === 0 - 
				(model.boardSize - 1));
			let winLineToWinP = model.cells.find(item => item.toWinP === 0 + 
				(model.boardSize - 1));
			let winLineCloseToWinAI = model.cells.find(item => item.toWinP === 0 - 
				(model.boardSize - 2) && item.hits.includes(''));
			let winLineCloseToWinP = model.cells.find(item => item.toWinP === 0 + 
				(model.boardSize - 2) && item.hits.includes(''));			
			if (winLineToWinAI){
				location = winLineToWinAI.locations[winLineToWinAI.hits.indexOf('')];
			} else if (winLineToWinP){
				location = winLineToWinP.locations[winLineToWinP.hits.indexOf('')];
			} else if (winLineCloseToWinAI){
				location = winLineCloseToWinAI.locations[winLineCloseToWinAI.hits.indexOf('')];
			} else if (winLineCloseToWinP){
				location = winLineCloseToWinP.locations[winLineCloseToWinP.hits.indexOf('')];
			} else {
				location = randomLocation();
				console.log('random (last) move'); //для большего поля нужно другое решение  
			}
		}
		location && model.freeCells.length > 0 ? 
			parseAIMove(location) : console.log('Error: no free cells');
	}
};

function parseMove(location){ //валидатор хода игрока
	if ((model.freeCells.indexOf(location) >= 0) && (!model.gameOver)){
		model.playerTurn(location);
	} else {
		view.displayMessage('Ячейка занята!');
		setTimeout(function(){
			view.displayMessage('Ваш ход!');
		}, 1000);
	}
}

function parseAIMove(location){ //валидатор хода компьютера
	if ((model.freeCells.indexOf(location) >= 0) && (!model.gameOver)){
		model.AITurn(location);
	} else {
		controller.AIMove();
	}  
}

function randomLocation(){
	let location = model.freeCells[Math.floor(Math.random() * model.freeCells.length)];
	return location;
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
	document.getElementById('endGameButton').onclick = function(){
		endGame(); 
		playSound(clockSound);
	}; 
	document.getElementById('continueGameButton').onclick = function(){
		continueGame(); 
		playSound(clockSound);
	};
	document.getElementById('soundMode').onclick = function(){
		changeSound(); 
		playSound(clockSound);
	};	
	document.getElementById('colorMode').onclick = function(){
		changeColorScheme(); 
		playSound(clockSound);
	};
	view.displayStat();	
}

function start (sym){ // старт игры
	document.querySelector('#window').style.display = 'none';
	document.querySelector('#endGameButton').style.display = 'block';
	document.querySelector('#continueGameButton').style.display = 'block';
	setGrid();
	setFreeCells();
	setStar(randomLocation()); 	
	view.displayStat();
	if (sym === 'x'){
		model.currentPlayer = 'x';
		model.currentAI = 'o';
		view.displayMessage('Ваш ход!');
		model.currentMove = model.currentPlayer;
	} else {
		model.currentPlayer = 'o';
		model.currentAI = 'x';
		setTimeout(function(){
			controller.AIMove();
		}, 750);
		view.displayMessage('Ход противника!');
		model.currentMove = model.currentAI;
	}
}

function setGrid(){ // генерация координат ячеек и установка слушателя для кликов игрока
	for (let i = 0; i < model.boardSize; i++){
		for (let j = 0; j < model.boardSize; j++){
			let location = i + '' + j;
			document.getElementById(location).addEventListener('click', function (e){
				if (document.querySelector('#window').style.display === 'none' && 
					model.currentMove !== model.currentAI && !model.gameOver){
					controller.playerMove(location);
				}
			});
		}
	}
}

function setFreeCells(){ // генерация координат свободных ячеек
	for (let i = 0; i < model.boardSize; i++){
		for (let j = 0; j < model.boardSize; j++){
			let location = i + '' + j;
			model.freeCells.push(location);
		}
	}
}

function setStar (location){ // размещение звезды на поле
	let star = document.createElement('img');
	star.src = 'star.png';
	star.id = 'star';
	document.getElementById(location).append(star);
	model.currentStarLocation = location;	
}

function endGame(){ // создание новой игры
	setTimeout(function(){
		view.displayMessage('Крестики-нолики');
	}, 300);
	clearBoard();
	model.rounds = 0;
	model.playerScore = 0;
	model.AIScore = 0;
	model.currentPlayer = null;
	model.currentAI = null;
	model.currentMove = null;
	document.querySelector('#window').style.display = 'block';
	document.querySelector('#endGameButton').style.display = 'none';
	document.querySelector('#continueGameButton').style.display = 'none';
	view.displayStat(); 
}

function clearBoard(){ // очистка поля и статистики текущей партии
	for (let i = 0; i < model.boardSize; i++){
		for (let j = 0; j < model.boardSize; j++){
			let idBoard = i + '' + j;
			document.getElementById(idBoard).classList.remove('x', 'o');
		}
	}
	view.removeLine();
	model.gameOver = false;
	model.moves = 0;
	model.freeCells = [];
	for (let i = 0; i < model.cells.length; i++){
		let winLine = model.cells[i];
		winLine.toWinP = 0;
		for (let j = 0; j < model.boardSize; j++){
			winLine.hits[j] = '';
		}
	}
	removeStar();	
}

function removeStar(){ // убрать звезду с поля
	document.getElementById('star').remove();
	model.currentStarLocation = null;
}

function continueGame(){ // начало новой партии текущей игры
	if (model.gameOver === true){
		clearBoard();
		setFreeCells();
		setStar(randomLocation());
		if (model.currentPlayer === 'x'){
			view.displayMessage('Ваш ход!');
			model.currentMove = model.currentPlayer;
		} else {
			setTimeout(function(){
				controller.AIMove();
			}, 750);
			view.displayMessage('Ход противника!');
			model.currentMove = model.currentAI;
		}
	}
}

function changeSound(){ // смена беззвучного режима
	if (document.getElementById('soundMode').classList.contains('sound')){
		document.getElementById('soundMode').setAttribute('class', 'mute');
	} else {
		document.getElementById('soundMode').setAttribute('class', 'sound');
	}
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

function playSound(sound){ // воспроизведение звука в зависимости от режима громкости
	document.getElementById('soundMode').classList.contains('sound') ? sound.play() : false;
}

window.onload = init;