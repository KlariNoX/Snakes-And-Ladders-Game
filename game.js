'use strict';

function setPositions() {
	const positions=[];
	const snakePositions = [13,38,46,73,82,87]
	const snakeNewPositions = [3,18,26,33,52,67]

	const ladderPositions = [4,9,31,48,56,78]
	const ladderNewPositions = [6,29,71,59,86,89]
	
	const snakes_or_ladders_Positions = [25,65,70]
	const snakes_or_ladders_NewPositions = ["5 or 45","44 or 74","49 or 90"]

	for (var i = 1; i <=90 ; i++) {
	 positions[i]=new Object();
	 positions[i].from=i;
	 
	  
	 if(snakePositions.indexOf(i)!=-1){
	   positions[i].to=snakeNewPositions[snakePositions.indexOf(i)];
	   positions[i].type="Snake";
	 }
	 else if(ladderPositions.indexOf(i)!=-1){
	   positions[i].to=ladderNewPositions[ladderPositions.indexOf(i)];
	   positions[i].type="Ladders";
	 }
	 else if(snakes_or_ladders_Positions.indexOf(i)!=-1){
	   positions[i].to=snakes_or_ladders_NewPositions[snakes_or_ladders_Positions.indexOf(i)];
	   positions[i].type="Snake or Ladders";
	 }
	 else if(i===16 || i===42 || i===68 || i===84){
		positions[i].to=i;
		positions[i].type="Snake Charmer";   
	 }
	 else if(i==2 || i===22 || i===39 || i===57 || i===75){
		positions[i].to="1 with "+(100-i)+"% possibility or 90 with "+i+" % possibility";
		positions[i].type="ALL IN";
	 }
	 else{
	   positions[i].to=i;
		positions[i].type="Normal";   
	   
	 }
	}
	return positions; 
}

var cells=setPositions();

for (var i = 1; i <=90 ; i++) {
    console.log("Cell: "+i+" type: "+cells[i].type+" From: "+cells[i].from+" To: "+cells[i].to)
}

const BOARD_SIZE = 90;
const START_POSITION = 0;
const DICE_SIDES = 6;

function Player(name, color){
	this.position=0;
	this.name=name;
	if (color.toLowerCase() != "red" && color.toLowerCase() != "white"){
		throw new Error(`Invalid color "${color}". Must be "red" or "white".`);
	}
	this.color=color;
    this.areSnakesAsleep = 0; // Maximum value is 5. Represents how many turns until snakes wake up.
}

const Game = {
    player1: new Player("John","Red"),
	player2: new Player("Sophie","White"),
    currentPlayer: null,
    turn : 0,
    lastDiceRoll: 0,
    Board: [],
    isOver: false
}


function initBoard(){
	var table = document.getElementById('mainTable');
	var tr = document.createElement('tr');

	for (var i = 9; i >=1; i--) {
	  var tr = document.createElement('tr');
	  for (var j = 9; j >=0; j--) {
	  var td1 = document.createElement('td');
	  var num=i*10-j;
	  td1.innerHTML="<div id='position"+num+"'><img  src='Assets/images/"+num+".png'  height=70 width=80></div>";
	  
	  tr.appendChild(td1);
	  
	  }
	  table.appendChild(tr);
	}
	Game.Board = setPositions();
}

function newGame(){

    // Start background music
    const music = document.getElementById("bg-music");
    music.volume = 0.3; // 0.0 - 1.0, make it quieter
    music.play().catch(err => {
        console.log("Could not start music:", err);
    });

    Game.currentPlayer = null;
    Game.player1.position = START_POSITION;
    Game.player2.position = START_POSITION;
    Game.lastDiceRoll = 0;
    Game.isOver = false;
    Game.player1.areSnakesAsleep = 0;
    Game.player2.areSnakesAsleep = 0;

	
	// Initialize a new game
	console.log("New Game Started");

    // Randomly determine who plays first
    Game.turn = Math.floor(Math.random() * 2) + 1;
	if (Game.turn === 1) {
		Game.currentPlayer = Game.player1;
	}
	else{
		Game.currentPlayer = Game.player2;
	}

	// Update UI to show players and turn
	updateGUI();
}

function updateGUI(){
    // Update the GUI to reflect the current game state

    // Infobox update
    var infoTable = document.getElementById("infoBox");
    var row = infoTable.rows[1];
    var currentTurnCell = row.cells[0];
    var diceRollCell = row.cells[1];
    currentTurnCell.textContent = Game.currentPlayer.name;
    if (Game.lastDiceRoll === 0) {
        diceRollCell.textContent = "-";
    }
    else{
        diceRollCell.innerHTML = '<img src="Assets/ImagesDice/' + Game.lastDiceRoll + '.png" alt="Dice" width="30"/>';
    }

    // Board update
    for (var i = 1; i <= BOARD_SIZE; i++) {
        var cell = document.getElementById("position" + i);
        if (Game.player1.position === i && Game.player2.position === i) {
            cell.innerHTML = "<img  src='Assets/imagesBoth/"+i+".png'  height=70 width=80>";
        }
        else if (Game.player1.position === i) {
            cell.innerHTML = "<img  src='Assets/images" + Game.player1.color + "/"+i+".png'  height=70 width=80>";
        }
        else if (Game.player2.position === i) {
            cell.innerHTML = "<img  src='Assets/images" + Game.player2.color + "/"+i+".png'  height=70 width=80>";
        }
        else {
            cell.innerHTML = "<img  src='Assets/images/"+i+".png'  height=70 width=80>";
        }
    }


}

function rollDice(){
    return Math.floor(Math.random() * DICE_SIDES) + 1;
}

async function play(){
    // Check if game has started
    if (Game.currentPlayer === null){
        alert("Please start a new game first.");
        return;
    }

    // Check if game is over
    if (Game.isOver){
        alert("The game is over. Please start a new game.");
        return;
    }

    if (Game.currentPlayer.areSnakesAsleep > 0){
        Game.currentPlayer.areSnakesAsleep -= 1;
    }

	Game.lastDiceRoll = rollDice();
    console.log(Game.currentPlayer.name + " rolled a " + Game.lastDiceRoll);


	var newPosition = Game.currentPlayer.position + Game.lastDiceRoll;

    // If new position is past the end, the position is changed twice, so that it can be animated properly.
    if (newPosition > BOARD_SIZE) {
        var rollback = newPosition - BOARD_SIZE;
        newPosition = BOARD_SIZE;
        await changePosition(Game.currentPlayer, BOARD_SIZE);
        if (rollback > 0) {
            await changePosition(Game.currentPlayer, Game.currentPlayer.position - rollback);
        }
    }
    else{
        await changePosition(Game.currentPlayer, Game.currentPlayer.position + Game.lastDiceRoll);
    }

    if (Game.Board[Game.currentPlayer.position].type === "ALL IN") {
        let oddsOfWinning = Game.currentPlayer.position;
        let oddsOfLosing = 100 - oddsOfWinning;
        let willGamble = confirm(Game.currentPlayer.name + " landed on ALL IN. Do you want to gamble? Probability of moving to 1 is " + oddsOfLosing + "%, Probability of moving to 90 is " + oddsOfWinning + "%.");
        if (willGamble) {
            let rand = Math.random() * 100;
            if (rand <= oddsOfWinning) {
                await changePosition(Game.currentPlayer, 90);
                console.log(Game.currentPlayer.name + " gambled and won! Moved to position 90.");
            }
            else {
                await changePosition(Game.currentPlayer, 1);
                console.log(Game.currentPlayer.name + " gambled and lost! Moved to position 1.");
            }
        }
    }
    else if (Game.Board[Game.currentPlayer.position].type === "Snake Charmer") {
        console.log("[DEBUG] - "+ Game.currentPlayer.name + " landed on Snake Charmer.");
        Game.currentPlayer.areSnakesAsleep = 5;
    }

	if(hasPlayerWon(Game.currentPlayer)){
		alert(Game.currentPlayer.name + " has won the game!");
        Game.isOver = true;
        return;
	}

	if (Game.lastDiceRoll != DICE_SIDES){ 
		changePlayerTurn();
	}
}

async function changePosition(player, newPosition){

    if (player.position < newPosition){
        for (let i = player.position + 1; i <= newPosition; i++) {
            console.log("[DEBUG] - Moving " + player.name + " to position " + i);
            player.position = i;
            updateGUI();
            new Audio("Assets/sound/pawnmove.mp3").play();
            await sleep(500);
        }
    }
    else if (player.position > newPosition){
        for (let i = player.position - 1; i >= newPosition; i--) {
            console.log("[DEBUG] - Moving " + player.name + " to position " + i);
            player.position = i;
            updateGUI();
            new Audio("Assets/sound/pawnmove.mp3").play();
            await sleep(500);
        }
    }

    // Ladder case
    if (Game.Board[newPosition].type === "Ladders") {
        newPosition = Game.Board[newPosition].to;
        console.log(player.name + " climbed a ladder to " + newPosition);
    }

	// Snake case
    if (Game.Board[newPosition].type === "Snake" && player.areSnakesAsleep <= 0) {
        newPosition = Game.Board[newPosition].to;
        console.log(player.name + " Was bitten by a snake and moved to " + newPosition);
    }

    // Snake or Ladder case
    if (Game.Board[newPosition].type === "Snake or Ladders") {
        let grade = Math.random() * 10;
        if (grade >= 5 || player.areSnakesAsleep > 0) {
            newPosition = parseInt(Game.Board[newPosition].to.split(" or ")[1]);
            console.log(player.name + " climbed a ladder to " + newPosition);

        }
        else {
            newPosition = parseInt(Game.Board[newPosition].to.split(" or ")[0]);
            console.log(player.name + " Was bitten by a snake and moved to " + newPosition);
        }
    }

    // Normal case.
    player.position=newPosition;

    updateGUI();			
}

function hasPlayerWon(player){
    return player.position === BOARD_SIZE;
}

function changePlayerTurn(){
    if (Game.currentPlayer === Game.player1) {
        Game.currentPlayer = Game.player2;
    }
    else {
        Game.currentPlayer = Game.player1;
    }
    updateGUI();
}

function toggleMusic() {
    const music = document.getElementById("bg-music");
    if (music.paused) {
        music.play();
    } else {
        music.pause();
    }
}

// I don't think I'm going to use this, but the assignment asks for it. So here it is.
function getCurrentPlayer(){
    return Game.currentPlayer;
}

// DISCLAIMER: COPIED FROM THE WEB. NOT MY OWN CODE!
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

