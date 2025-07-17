document.addEventListener("DOMContentLoaded", () => {
  const board = Array(24).fill(null);
  let currentPlayer = "player1";
  let phase = "placing";
  let removeMode = false;
  let selecetedSpot = null; // stores index of the selected piece
 let player1PiecesOnBoard = 0; // tracks player1s pieces on the board
 let player2PiecesOnBoard = 0; // tracks player2s pieces on the board

  const statusEl = document.getElementById("status");
  const spots = document.querySelectorAll(".spot");

  const piecesPlaced = {
    player1: 0,
    player2: 0
  };

const millCombos = [
  // Horizontal Mills
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Outer Square
  [9, 10, 11], [12, 13, 14], [15, 16, 17], // Middle Square
  [18, 19, 20], [21, 22, 23], // Inner Square 

  // Vertical Mills
  [0, 9, 21], [3, 10, 18], [6, 11, 15], // Left side vertical
  [1, 4, 7], // Middle vertical on outer board
  [16, 19, 22], // Middle vertical on inner board
  [2, 14, 23], [5, 13, 20], [8, 12, 17]  // Right side vertical
];

const adjacencyList = { 
    0: [1, 9],
    1: [0, 2, 4],
    2: [1, 14],
    3: [4, 10],
    4: [1, 3, 5, 7],
    5: [4, 13],
    6: [7, 11],
    7: [4, 6, 8],
    8: [7, 12],
    9: [0, 10, 21],
    10: [3, 9, 11, 18],
    11: [6, 10, 15],
    12: [8, 13, 17],
    13: [5, 12, 14, 20],
    14: [2, 13, 23],
    15: [6, 11, 16],
    16: [15, 17, 19],
    17: [8, 12, 16, 20],
    18: [3, 10, 19],
    19: [16, 18, 20, 22],
    20: [5, 13, 19],
    21: [0, 9, 22],
    22: [19, 21, 23],
    23: [2, 14, 22]
  };

  function isAdjacent(from, to) {
    return adjacencyList[from] && adjacencyList[from].includes(to);
  }


  // Add event listeners to each spot
  spots.forEach(spot => {
    spot.addEventListener("click", handleSpotClick);
  });

 function handleSpotClick(e) {
    const spot = e.target;
    const index = parseInt(spot.id.replace("spot-", ""));

    if (removeMode) {
      
      return;
    }

    if (phase === "placing") {
      
    } else if (phase === "moving") {
      // If no piece is selected yet
      if (selectedSpot === null) {
        // Try to select a piece
        if (board[index] === currentPlayer) {
          selectedSpot = index;
          spot.classList.add("selected"); // Add a class for visual feedback
          statusEl.textContent = `⚓ ${capitalize(currentPlayer)}, move piece from spot ${index}.`;
        } else if (board[index] === null) {
          statusEl.textContent = "Aye, pick one of yer own pieces to move!";
        } else {
          statusEl.textContent = "Shiver me timbers! That's not yer piece!";
        }
      } else {
        // A piece is already selected, now try to move it
        if (selectedSpot === index) { // Clicked the same spot, deselect
          spots[selectedSpot].classList.remove("selected");
          selectedSpot = null;
          statusEl.textContent = `${capitalize(currentPlayer)}'s turn. Deselected piece.`;
          return;
        }
       else if (phase === "flying") {
      if (selectedSpot === null) {
        if (board[index] === currentPlayer) {
          selectedSpot = index;
          spot.classList.add("selected");
          statusEl.textContent = `Ahoy, ${capitalize(currentPlayer)}, fly yer piece from spot ${index}!`;
        } else if (board[index] === null) {
          statusEl.textContent = "Ye need to select yer own piece to fly, savvy?";
        } else {
          statusEl.textContent = "That be a rival's piece, ye can't fly that!";
        }
      } else {
        if (selectedSpot === index) { // Clicked the same spot, deselect
          spots[selectedSpot].classList.remove("selected");
          selectedSpot = null;
          statusEl.textContent = `${capitalize(currentPlayer)}'s turn. Deselected piece.`;
          return;
        }
        if (board[index] === null) { // Any empty spot is valid for flying
          board[index] = currentPlayer;
          board[selectedSpot] = null;

          spots[selectedSpot].classList.remove(currentPlayer, "selected");
          spot.classList.add(currentPlayer);

          let message = `${capitalize(currentPlayer)} flew from ${selectedSpot} to ${index}.`;

          if (checkMill(index, currentPlayer)) {
            message = `🎉 ${capitalize(currentPlayer)} formed a MILL! Remove one of your opponent's pieces.`;
            removeMode = true;
            statusEl.textContent = message;
          } else {
            currentPlayer = getOpponent(currentPlayer);
            updateStatus();
          }
          selectedSpot = null;
        } else {
          statusEl.textContent = "That spot be taken, scurvy dog! Find an empty one.";
        }
      }
    }





        // Check if the destination spot is empty and adjacent
        if (board[index] === null && isAdjacent(selectedSpot, index)) {
          // Move the piece
          board[index] = currentPlayer;
          board[selectedSpot] = null;

          spots[selectedSpot].classList.remove(currentPlayer, "selected");
          spot.classList.add(currentPlayer);

          let message = `${capitalize(currentPlayer)} moved from ${selectedSpot} to ${index}.`;

          if (checkMill(index, currentPlayer)) {
            message = `🎉 ${capitalize(currentPlayer)} formed a MILL! Remove one of your opponent's pieces.`;
            removeMode = true;
            statusEl.textContent = message;
            // No turn change yet, player gets to remove a piece
          } else {
            currentPlayer = getOpponent(currentPlayer);
            updateStatus();
          }

          selectedSpot = null; // Reset selected spot
        } else {
          statusEl.textContent = "That be an invalid move, scallywag! Spot not empty or not adjacent.";
        }
      }
    }
  }
});

// After a piece is removed or moved, check for flying phase
function checkGamePhase() {
  if (piecesPlaced.player1 === 9 && piecesPlaced.player2 === 9) {
    if (player1PiecesOnBoard < 3) {
      phase = "flying";
      statusEl.textContent = `Arrr, ${capitalize(currentPlayer)} can now FLY!`;
    } else if (player2PiecesOnBoard < 3) {
      phase = "flying";
      statusEl.textContent = `Arrr, ${capitalize(currentPlayer)} can now FLY!`;
    } else {
      phase = "moving"; // Default to moving if not flying
    }
  }
}
// Call checkGamePhase() at the end of handleSpotClick or after any piece movement/removal

function checkWinCondition() {
    const opponent = getOpponent(currentPlayer);
    const opponentPieces = board.filter(piece => piece === opponent).length;

    if (opponentPieces < 3) {
      statusEl.textContent = `🏴‍☠️ ${capitalize(currentPlayer)} WINS! The ${capitalize(opponent)} has fewer than 3 pieces!`;
      // Disable further moves or show a restart button
      disableBoardClicks(); // You'd need to implement this
      return true;
    }

    // Check if the opponent has any valid moves (only relevant in moving/flying phase)
    if (phase === "moving" || phase === "flying") {
      let hasValidMove = false;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === opponent) { // Check each of opponent's pieces
          const possibleMoves = adjacencyList[i] || [];
          if (phase === "flying") { // If flying, any empty spot is a valid move
            if (board.includes(null)) {
                hasValidMove = true;
                break;
            }
          } else { // Moving phase, check adjacent empty spots
            for (const adjSpot of possibleMoves) {
              if (board[adjSpot] === null) {
                hasValidMove = true;
                break;
              }
            }
          }
        }
        if (hasValidMove) break;
      }

      if (!hasValidMove) {
        statusEl.textContent = `🏴‍☠️ ${capitalize(currentPlayer)} WINS! The ${capitalize(opponent)} has no legal moves!`;
        disableBoardClicks();
        return true;
      }
    }
    return false;
  }

  function disableBoardClicks() {
    spots.forEach(spot => {
      spot.removeEventListener("click", handleSpotClick);
      spot.style.cursor = "not-allowed";
    });
  }


// --------------------- NEED TO DO----------------------------------

// fix mill detection
// enhance checkMill 
// finish the remaining 2 phases
// 










// -------- old build with provided code ------------------------


// // =======================================
// // 1. Board Setup: 24 playable positions
// // =======================================

// const board = Array(24).fill(null); // "P1", "P2", or null
// let currentPlayer = "P1";

// const millCombos = [
//   [0, 1, 2],   [3, 4, 5],   [6, 7, 8],
//   [9, 10, 11], [12, 13, 14], [15, 16, 17],
//   [18, 19, 20], [21, 22, 23],
//   [0, 9, 21],  [3, 10, 18], [6, 11, 15],
//   [1, 4, 7],   [16, 19, 22], [8, 12, 17],
//   [5, 13, 20], [2, 14, 23]
// ];

// // =======================================
// // 2. UI Rendering
// // We'll use grid positions (static for now)
// // =======================================

// const boardEl = document.getElementById("board");

// // Playable positions only — mapped visually in an 8x8 grid
// const playableIndices = [
//   0, 1, 2,      -1,     3, 4, 5,
//   -1, -1, -1,   -1,     6, 7, 8,
//   -1, -1, -1,   9,     10,11,-1,
//   -1, -1, -1,  12,     13,14,-1,
//   -1, -1, -1,  15,     16,17,-1,
//   -1, -1, -1,  18,     19,20,-1,
//   21,22,23,     -1,    -1,-1,-1
// ];

// // Render grid: total of 49 slots in an 8x8 layout
// for (let i = 0; i < 49; i++) {
//   const div = document.createElement("div");

//   if (playableIndices[i] !== -1 && playableIndices[i] !== undefined) {
//     div.classList.add("tile");
//     div.dataset.index = playableIndices[i];
//     div.addEventListener("click", handlePlace);
//   } else {
//     div.style.visibility = "hidden"; // blank space in the layout
//   }

//   boardEl.appendChild(div);
// }

// // =======================================
// // 3. Mill Checking Function
// // =======================================

// function checkMill(position, player) {
//   const relevantCombos = millCombos.filter(combo => combo.includes(Number(position)));
//   return relevantCombos.some(combo => combo.every(i => board[i] === player));
// }

// // =======================================
// // 4. Place Piece Handler
// // =======================================

// function handlePlace(event) {
//   const index = parseInt(event.target.dataset.index);

//   if (board[index]) {
//     console.log("❌ That spot is taken.");
//     return;
//   }

//   // Place the piece
//   board[index] = currentPlayer;
//   event.target.classList.add(currentPlayer);

//   console.log(`🎯 ${currentPlayer} placed at ${index}`);

//   // Check for mill
//   if (checkMill(index, currentPlayer)) {
//     console.log(`🎉 ${currentPlayer} formed a MILL!`);
//     // In full game, trigger "remove opponent piece" mode here
//   }

//   // Switch player
//   currentPlayer = currentPlayer === "P1" ? "P2" : "P1";