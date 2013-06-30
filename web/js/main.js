var Ultic = {};
var padding = 20;

var Grid = function() {
    var blank = function(type) {
        return {
            result: function() {
                return type;
            }
        };
    };

    var _grid = function(){
        var subgrid = {};
        for (var i = 0; i < 9; i++) {
            subgrid[i] = blank('u');
        };
        return subgrid;
    }();

    var _result = 'u';

    var winConditions = [7, 56, 73, 84, 146, 273, 292, 448];

    var checkResult = function() {
        var xMask = 0;
        var oMask = 0;
        for (var i = 0; i < 9; i ++) {
            if (_grid[i] && _grid[i].result()) {
                if (_grid[i].result() == 'x') {
                    xMask |= Math.pow(2, i);
                } else if(_grid[i].result() == 'o') {
                    oMask |= Math.pow(2, i);
                }
            }
        }
        // Compare winning conditions
        for (var i = winConditions.length - 1; i >= 0; i--) {
            if ((xMask & winConditions[i]) === winConditions[i]) {
                console.log('X wins');
                return 'x';
            }
            if ((oMask & winConditions[i]) === winConditions[i]) {
                console.log('O wins');
                return 'o';
            }
        };
        return 'u';
    }
    var grid = {
        result: function() {
            if (_result !== 'u') return _result;
            _result = checkResult();
            return _result;
        },
        set: function(grid, state) {
            _grid[grid] = state;

            // Workout winning conditions

        },
        get: function(grid) {
            return _grid[grid];
        },
        flatten: function() {
            var grid = {};
            for (var i = 0; i < 9; i++) {
                var state = this.get(i);
                if (state && typeof state == 'object') {
                    grid[i] = state.flatten();
                } else {
                    grid[i] = state;
                }
            }
            return grid;
        },
        createEmpty: function() {
            for (var i = 0; i <= 9; i++) {
                this.set(i, new Grid());
            }
        },
        blank: blank
    }
    return grid;
}

function Board(canvas, width, height) {

    function line(startX, startY, endX, endY) {
        canvas.moveTo(startX, startY);
        canvas.lineTo(endX, endY);
    }

    var drawGrid = function(x, y, width, height) {
        canvas.beginPath();
        line(x + width/3, y, x + width/3, y + height);
        line(x + width/3*2, y, x + width/3*2, y + height);
        line(x, y + height/3, x + width, y + height/3);
        line(x, y + height/3*2, x + width, y + height/3*2);
        canvas.stroke();
    };

    function getCoordFromNum(num) {
        return [num % 3, Math.floor(num/3)];
    }

    var draw = function(cell) {
        canvas.clearRect(0,0,width,height);
        drawGrid(0, 0, width, height);
        var sWidth = width/3 - (padding*2);
        var sHeight = height/3 - (padding*2);
        for (var i=0; i<=8; i++) {
            if (i == cell) {
                canvas.strokeStyle = 'red';
            }
            var coords = getCoordFromNum(i);
            drawGrid(coords[0] * width/3 + padding, coords[1] * height/3 + padding, sWidth, sHeight);
            canvas.strokeStyle = 'black';
        }
    };

    return {
        draw: draw
    };

};

function Game(canvas, width, height, board) {

	var socket;
	var player = 1;
    var grid = new Grid();
    grid.createEmpty();
    board.draw();

    function posToMainGrid(x, y) {
        var cellWidth = width/3;
        var cellHeight = height/3;

        var mainX = Math.floor(x/(cellWidth));
        var mainY = Math.floor(y/(cellHeight));
        return [mainX, mainY];
    }
    function posToGrid(x, y) {
        var cellWidth = width/3;
        var cellHeight = height/3;

        var main = posToMainGrid(x, y);

        var relX = x - (main[0] * cellWidth) - padding;
        var relY = y - (main[1] * cellHeight) - padding;
        if (relX < 0 || relY < 0 || relX > (cellWidth- padding*2) || relY > (cellHeight- padding*2)) {
            return false;
        }
        var subX = Math.floor(relX/((cellWidth-padding*2) /3));
        var subY = Math.floor(relY/((cellHeight-padding*2) / 3));
        return [main, [subX, subY]];
    }

    function coordToSimple(pos) {
        var main = pos[0][1] * 3 + pos[0][0];
        var sub = pos[1][1] * 3 + pos[1][0];
        return [main, sub];
    }

    function gridToDraw(pos) {
        var mainX = pos[0][0] * width/3;
        var mainY = pos[0][1] * width/3;
        var cellWidth = (width/3 - padding *2)/3;
        var cellHeight = (height/3 - padding *2)/3;
        var subX = mainX + pos[1][0] * cellWidth + cellWidth/2 + padding;
        var subY = mainY + + pos[1][1] * cellHeight + cellHeight/2 + padding;
        return [subX, subY];
    }

    function drawMoveX(pos, size) {
        canvas.lineWidth = 2 * size || 1;
        var size = width/6/3 * (size || 1);
        var x = pos[0] - size/2;
        var y = pos[1] - size/2;
        canvas.beginPath();
        canvas.moveTo(x, y);
        canvas.lineTo(x + size, y + size);
        canvas.moveTo(x + size, y);
        canvas.lineTo(x, y + size);
        canvas.stroke();
        canvas.lineWidth = 1;
    }

    function drawMoveY(pos, size) {
        canvas.lineWidth = 2 * size || 1;
        var size = width/10/3 * (size || 1);
        canvas.beginPath();
        canvas.arc(pos[0], pos[1], size, 0, Math.PI*2, true);
        canvas.closePath();
        canvas.stroke();
        canvas.lineWidth = 1;
    }

    function drawMove(pos) {
        drawPos = gridToDraw(pos);
        if (player) {
            drawMoveX(drawPos);
        } else {
            drawMoveY(drawPos);
        }
    }

    function markWin(player, pos) {
        var x = pos[0] * width/3 + width/3/2;
        var y = pos[1] * height/3 + height/3/2;
        if (player == 'x') {
            drawMoveX([x,y],4);
        } else {
            drawMoveY([x,y],4);
        }
    }

    var lastMove = null;

    var move = function(x, y) {
		//console.log('debugging `socket`(in move method):',socket);
        var pos = posToGrid(x, y);
        if (!pos) return;

        var coord = coordToSimple(pos);
		console.log('debugging `coord`(in move method):',coord);
        var spot = grid.get(coord[0]).get(coord[1]);
        if (spot.result() != 'u')  return;

        if (lastMove && coord[0] != lastMove[1]) { console.log('returning from move()'); return}
        lastMove = coord;

        grid.get(coord[0]).set(coord[1], grid.blank(player ? 'x' : 'o'));
        var result = grid.get(coord[0]).result();
        drawMove(pos);
        board.draw(coord[1]);
        if (result != 'u') {
            markWin(result, pos[0]);
        }

        player = !player;
    };

	var setSocket = function(s){
		socket = s;
	}

    return {
        move: move,
		setSocket: setSocket
    };
}

$(function() {

	var width = 500;
    var height = width;

	Ultic.gameCanvas = document.getElementById('gamearea').getContext('2d');
    Ultic.boardCanvas = document.getElementById('board').getContext('2d');

    var board = new Board(Ultic.boardCanvas, width, height);

    var game = new Game(Ultic.gameCanvas, width, height, board);

	var socket = io.connect('http://localhost:8001');

	game.setSocket(socket);

	console.log('debugging socket:',socket);


	/**
	 * Socket events
	 */



	socket.on('connect', function () {
		//$('#output').append('<div>Connected to the room!</div><br>');
		//console.log('debugging `this`:',this);
	});

	socket.on('userjoined', function (data) {


		if(typeof game.players == 'undefined'){
			game.players = {};
		}

		game.players[data.name] = '';

		if(game.guestname !== data.name){
			$('#output').append('<div>'+data.name+' joined the room!</div><br>');
		}

	});

	socket.on('userdisconnect', function (data) {
		$('#output').append('<div>'+data.name+' left the room!</div><br>')
	});

	socket.on('rendermove', function (data) {

		console.log('received a move! heres the data:',data);
		//console.log('logging game in rendermove event:',game);
		//console.log('logging game.players:',game.players);

		if(game.firstMove){
			game.players[data.guestname] = 'X';
			game.currentPlayer = 'O';

			if(data.guestname != game.guestname){
				game.players[game.guestname] = 'O';
			}else{
				for(i in game.players){
					if(i != game.guestname){
						game.players[i] = 'O';
					}
				}
			}
			game.firstMove = false;
		}else{

			if(game.lastMove == data.guestname){
				if(data.guestname == game.guestname){
                    window.alert('not your goddamn turn, goddammit');
                }				
				return;
			}
			game.currentPlayer = game.currentPlayer == 'O'?'X':'O';
		}

		$status = $('#status').html('<span style="text-align:center;">You are player '+game.players[game.guestname]+'</span>');
		if(game.currentPlayer == game.players[game.guestname]){
			$("#turn-notice").html('ITS YOUR TURN').css('background-color','lime');
		}else{
			//$title.css('background-color','transparent');
			$('#turn-notice').html('OPPONENTS TURN').css('background-color','red');
			//console.debug($('#turn-notice'));
		}
		game.lastMove = data.guestname;
		game.move(data.x,data.y);

	 });


	 //join the mutual room
	 var room = '1';//prompt('Room to join:');
	 var guestname = 'Guest'+getRandomInt(1000,9999);//prompt('What is your name?');
	 game.guestname = guestname;
	 game.firstMove = true;
	 socket.guestname = guestname;
	 socket.emit('subscribe',{
		 'room': room,
		 'name': guestname
	 });

    $('#gamearea').click(function(e) {
        var x = e.offsetX;
        var y = e.offsetY;

		socket.emit('onmove',{x:x,y:y,guestname:game.guestname});
        //game.move(x, y);
    })
});

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}