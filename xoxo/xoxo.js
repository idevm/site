var view = {
	displayMessage: function (msg){
		var messageArea = document.getElementById('messageArea');
		messageArea.innerHTML = msg;
	},
	displayX: function (location){
		var cell = document.getElementById(location);
		cell.setAttribute('class', 'x');
	},
	displayO: function (location){
		var cell = document.getElementById(location);
		cell.setAttribute('class', 'o');
	}
};

var model = {
	boardSize: 3,
	playerTurn: function(location){
		hit(location, 'x');
		this.closedCells.push(location);
		view.displayX(location);
		controller.AIMove();
	},
	AITurn: function(location){
		hit(location, 'o');
		this.closedCells.push(location);
		view.displayO(location);
	},
	closedCells: [],
	cells: [
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

var controller = {
	playerMove: function(location){
		model.playerTurn(location);
	},
	AIMove: function(){
		var row = Math.floor(Math.random() * model.boardSize);
		var col = Math.floor(Math.random() * model.boardSize);
		var location = row + '' + col;
		model.AITurn(location);
	}
};

function init(){
	for (var i = 0; i < model.boardSize; i++){
	var row = i.toString();
	for (var j = 0; j < model.boardSize; j++){
		var col = j.toString();
		var idBoard = row + col;
		const location = idBoard;
		document.getElementById(idBoard).addEventListener('click', function (e){
			controller.playerMove(location)});
		}
	}

}

function hit(location, sym){
	for (var i = 0; i < model.boardSize * 2 + 2; i++){
		var winLine = model.cells[i];
		var index = winLine.locations.indexOf(location);
			if (index >= 0){
				winLine.hits[index] = sym;
			}
	}
}

window.onload = init;