// Retorna la url del servicio. Es una función de configuración.
function BBServiceURL() {
    return 'ws://localhost:8080/bbService';
}


class WSBBChannel {
    constructor(URL, callback) {
        this.URL = URL;
        this.wsocket = new WebSocket(URL);
        this.wsocket.onopen = (evt) => this.onOpen(evt);
        this.wsocket.onmessage = (evt) => this.onMessage(evt);
        this.wsocket.onerror = (evt) => this.onError(evt);
        this.receivef = callback;
        this.xIsNext = null;
    }


    onOpen(evt) {
        console.log("In onOpen", evt);
    }
    onMessage(evt) {
        console.log("In onMessage", evt);
        // Este if permite que el primer mensaje del servidor no se tenga en cuenta.
        // El primer mensaje solo confirma que se estableció la conexión.
        // De ahí en adelante intercambiaremos solo puntos(x,y) con el servidor
        
  
        if (evt.data != "Connection established.") {
        	if(evt.data == "xx"){
        		console.log("Entra en X inicial");
        		this.xIsNext = "xx";
        	}
        	else if(evt.data == "oo"){
        		console.log("Entra en O inicial");
        		this.xIsNext = "oo";
        	}
        	else{
        		console.log("El valor de ficha: ",this.xIsNext);
            	this.receivef(evt.data);
            }	
        }
    }
    
    onError(evt) {
        console.error("In onError", evt);
    }

    send(x, y) {
    	let alt=null;
    	if(y=="X"){
    		alt = "xx";
    	}
    	else if(y=="O"){
    		alt = "oo";
    	}
        let msg = '{ "x": ' + (x) + ', "y": ' + (null) +' "ficha": '+ (alt) +"}";
        console.log("sending: ", msg);
        this.wsocket.send(msg);
    }


}
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.comunicationWS =
                new WSBBChannel(BBServiceURL(),
                        (msg) => {
                    console.log("En websocket: ",msg);
                    let contador=0;
                    for(let kk=0;kk<msg.length;kk++){
                    	//console.log("El valor: ",msg[kk],kk);
                    	if(msg[kk]==","){
                    		contador++;
                    	}                    
                    	if((msg[kk]=="X" || msg[kk]=="O")){
 							if(msg[msg.length-3]+msg[msg.length-2]=="xx"){
 								console.log("Tiene ficha!");
 							}                   		
 							else{
 								console.log("No la tiene",);
 							}
 							console.log("El contador que se manda: ",contador);
                    		this.handleClick(contador);
                    	} 
                    	
                    }
                });
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
    console.log("Estado en constructor :",this.state);
    let wsreference = this.comunicationWS;
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }
  
  handleClick(i) {
  	console.log("Entrando en handleClick",i);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    //console.log("Esta indefinido en handle?: ",history);
    //console.log("Este es el indefinido: ",squares);
    console.log("El estado antes de: ",this.state);
    this.setState({
		history: history.concat([
        	{
	          squares: squares
    	    }
      	]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
    
    //console.log("Current: ",current);
    //console.log("Current squares: ",current.squares);
    console.log("Solo squares: ",squares);
    if(squares.length<=20){
    	this.comunicationWS.send(squares,squares[i]);	
    }
    //this.comunicationWS.send(squares);
  }



  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Ir a la jugada #' + move :
        'Ir al inicio';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Ganador: " + winner;
    } else {
      status = "Siguiente jugador : " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);