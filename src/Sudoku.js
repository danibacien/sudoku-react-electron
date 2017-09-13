import React, { Component } from 'react';
import logo from './logo.svg';
import './Sudoku.css';

class Sudoku extends Component {
  constructor() {
    super();
    this.state = initSudoku("F");
  }

  handleSquareSelection(x) {
    if(this.state.actual[x].initial === false) {
      this.setState({selected: x});
    }
  }

  handleNumberSelection(x) {
    if(this.state.selected !== null) {
      const newActual = this.state.actual;
      newActual[this.state.selected] = {value: x, initial: false};
      this.setState({actual: newActual});
    }
  }

  handleSelectDifficulty(event) {
    this.setState({difficulty: event.target.value});
  }

  handleNewGame() {
    this.setState(initSudoku(this.state.difficulty));
  }

  handleHint() {
    if(this.state.selected !== null) {
      const newActual = this.state.actual;
      newActual[this.state.selected] = {value: this.state.solution[this.state.selected], initial: false};
      this.setState({actual: newActual, hints: this.state.hints - 1});
    }
  }

  handleCheck() {
    let check = true;
    for(let i = 0; i < 81; i++) {
      if(this.state.actual[i].value !== this.state.solution[i]) {
        check = false;
        break;
      }
    }
    alert(check === true? "Congratulations!. Sudoku completed." : "Oooh. There are mistakes.");
  }

  handleCleanBoard() {
    const newActual = this.state.actual;
    for(let i = 0; i < 81; i++) {
      if(newActual[i].initial === false && newActual[i].value !== null) {
        newActual[i].value = null;
      }
    }
    this.setState({actual: newActual, selected: null});
  }

  render() {
    let valueSelected = null;
    if(this.state.selected !== null) {
      valueSelected = this.state.actual[this.state.selected].value;
    }
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Board values={this.state.actual} selected={this.state.selected} onClick={i=>this.handleSquareSelection(i)}/>
        <Menu select={(i)=>this.handleSelectDifficulty(i)}
              newBoard={(i)=>this.handleNewGame(i)}
              hintsLeft={this.state.hints}
              hint={()=>this.handleHint()}
              checkEnabled={boardFull(this.state.actual)}
              check={()=>this.handleCheck()}
              clean={()=>this.handleCleanBoard()}/>
        <Selector valueSelected={valueSelected} onClick={(i)=>this.handleNumberSelection(i)}/>
      </div>
    );
  }
}

class Board extends Component {
  renderSquare(i) {
    let selected = false;
    if(this.props.selected === i) {
      selected = true;
    }
    return (
      <SudokuSquare
        key={i}
        index={i}
        selected = {selected}
        info={this.props.values[i]}
        onClick={()=> this.props.onClick(i)}
        />
    );
  }

  render(){
    let squares = [];
    for(let square = 0; square < 9; square++) {
      let squareContent = [];
      for(let row = 0; row < 3; row++) {
        for(let col = 0; col < 3; col++) {
          let numSquare = ((Math.floor(square / 3) * 3) + row) * 9 + ((square % 3) * 3 + col);
          squareContent.push(this.renderSquare(numSquare));
        }
      }
      squares.push(<div className="square" key={square}>{squareContent}</div>);
    }
    return (
      <div className="sudoku">{squares}</div>
    );
  }
}

class SudokuSquare extends Component {
  render(){
    if(this.props.selected === true) {
      return <div className="selected" onClick={this.props.onClick}>{this.props.info.value}</div>;
    } else if(this.props.info.initial === false){
      return <div className="entry selectionable" onClick={this.props.onClick}>{this.props.info.value}</div>;
    } else {
      return <div onClick={this.props.onClick}>{this.props.info.value}</div>;
    }
  }
}

class Selector extends Component {
  render(){
    let numbers = [];
    for(let i = 1; i < 10; i++) {
      if(this.props.valueSelected === i) {
        numbers.push(<td className="selected" key={i} onClick={()=>this.props.onClick(i)}>{i}</td>);
      } else {
        numbers.push(<td className="selectionable" key={i} onClick={()=>this.props.onClick(i)}>{i}</td>);
      }
    }
    return (
      <table className="selector">
        <tbody>
          <tr>{numbers}</tr>
        </tbody>
      </table>
    );
  }
}

class Menu extends Component {
  render(){
    return (
      <div className="menu">
        <select value={this.props.level} onChange={this.props.select}>
          <option value="F">FÁCIL</option>
          <option value="M">MEDIO</option>
          <option value="D">DIFÍCIL</option>
        </select>
        <input type="button" value="New Game" onClick={this.props.newBoard}/>
        <hr/>
        <input type="button" value={"Hints Left: " + this.props.hintsLeft} disabled={this.props.hintsLeft === 0} onClick={this.props.hint}/>
        <input type="button" value="Check Board" disabled={!this.props.checkEnabled} onClick={this.props.check}/>
        <input type="button" value="Clean Board" onClick={this.props.clean}/>
      </div>
    );
  }
}

function generateSudoku() {
  let board = Array(81).fill(null);
  let row = Array(9).fill(null);
  for(let i = 0; i < 9; i++) {
    row[i] = i + 1;
  }
  shuffle(row);
  for(let i = 0; i < 9; i++) {
    board[i] = row[i];
  }
  for(let i = 1; i < 9; i++) {
    for(let j = 0; j < 9; j++) {
      if(i !== 3 && i !== 6) {
        board[j + (i * 9)] = j + 3 < 9 ? row[j + 3] : row[j + 3 - 9];
      } else {
        board[j + (i * 9)] = j + 1 < 9 ? row[j + 1] : row[j + 1 - 9];
      }
    }
    for(let k = 0; k < 9; k++) {
      row[k] = board[k + (i * 9)];
    }
  }
  return board;
}

function generatePuzzle(solution, level) {
  let squares = Array(81);
  let actual = Array(81).fill({value: null, initial: false});
  for(let i = 0; i < 81; i++) {
    squares[i] = i;
  }
  shuffle(squares);
  let numStartSquares;
  if(level === "F") {
    numStartSquares = Math.floor(Math.random() * 10 + 55);
  } else if(level === "M") {
    numStartSquares = Math.floor(Math.random() * 10 + 40);
  } else {
    numStartSquares = Math.floor(Math.random() * 10 + 26);
  }
  for(let i = 0; i < numStartSquares; i++){
    actual[squares[i]] = {value: solution[squares[i]], initial: true};
  }
  return actual;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function initSudoku(difficulty) {
  const solution = generateSudoku();
  let actual = generatePuzzle(solution, difficulty);
  return {
    solution: solution,
    actual: actual,
    selected: null,
    hints: 3,
    difficulty: difficulty,
  };
}

function boardFull(board) {
  for(let i = 0; i < 81; i++) {
    if(board[i].value === null) {
      return false;
    }
  }
  return true;
}

export default Sudoku;
