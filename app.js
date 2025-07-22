

document.addEventListener("DOMContentLoaded", () => {
  const board = Array(24).fill(null);
  let currentPlayer = "player1"; // player 1-red, player 2-blue
  let phase = "placing"; 
  let removeMode = false; // Tracks if it's in removal mode
  let selectedSpot = null; // Tracks the currently selected spot for moving/flying
  let player1PiecesOnBoard = 0; // Tracks pieces on the board for each player
  let player2PiecesOnBoard = 0; // Tracks pieces on the board for each player
  let millsToRemove = 0; // Tracks how many mills have been formed

  const statusEl = document.getElementById("status");
  const spots = document.querySelectorAll(".spot");
  const restartButton = document.getElementById("restartButton");
  const instructionsToggle = document.getElementById('instructionsToggle');
  const instructionsContent = document.getElementById('instructionsContent');
instructionsToggle.addEventListener('click', () => {
    
    instructionsContent.classList.toggle('show');

    
    if (instructionsContent.classList.contains('show')) {
        instructionsToggle.textContent = "Hide Instructions";
    } else {
        instructionsToggle.textContent = "Show Instructions";
    }
});
  const piecesPlaced = {
    player1: 0,
    player2: 0
  };

// updated mill combos list
const millCombos = [
    // --- Horizontal Mills ---
    [0, 1, 2],   // Outer Top
    [5, 6, 7],   // Outer Bottom

    [8, 9, 10],  // Middle Top
    [13, 14, 15], // Middle Bottom

    [16, 17, 18], // Inner Top
    [21, 22, 23], // Inner Bottom

    // --- Vertical Mills ---
    [0, 3, 5],   // Outer Left
    [8, 11, 13], // Middle Left
    [16, 19, 21], // Inner Left

    [1, 9, 17],  // Vertical Through Top-Middle
    [6, 14, 22], // Vertical Through Bottom-Middle

    [2, 4, 7],   // Outer Right
    [10, 12, 15], // Middle Right
    [18, 20, 23]  // Inner Right
  ];
 
  // updated the adjacency list
const adjacencyList = {
    // Outer Square
    0: [1, 3], // Outer Top-Left
    1: [0, 2, 9], // Outer Top-Middle
    2: [1, 4], // Outer Top-Right

    3: [0, 5, 11], // Outer Mid-Left
    4: [2, 7, 12], // Outer Mid-Right

    5: [3, 6], // Outer Bottom-Left
    6: [5, 7, 14], // Outer Bottom-Middle
    7: [4, 6], // Outer Bottom-Right

    // Middle Square
    8: [9, 11, 16], // Middle Top-Left
    9: [1, 8, 10, 17], // Middle Top-Middle
    10: [9, 12, 18], // Middle Top-Right

    11: [3, 8, 13, 19], // Middle Mid-Left
    12: [4, 10, 15, 20], // Middle Mid-Right

    13: [11, 14, 21], // Middle Bottom-Left
    14: [6, 13, 15, 22], // Middle Bottom-Middle
    15: [12, 14, 23], // Middle Bottom-Right

    // Inner Square
    16: [17, 19, 8], // Inner Top-Left
    17: [9, 16, 18, 22], // Inner Top-Middle
    18: [17, 20, 10], // Inner Top-Right

    19: [16, 21, 11], // Inner Mid-Left
    20: [18, 23, 12], // Inner Mid-Right

    21: [19, 22, 13], // Inner Bottom-Left
    22: [17, 21, 23, 14], // Inner Bottom-Middle
    23: [20, 22, 15] // Inner Bottom-Right
  };

 
  function isAdjacent(from, to) {
    return adjacencyList[from] && adjacencyList[from].includes(to);
  }

  spots.forEach(spot => {
    spot.addEventListener("click", handleSpotClick);
  });

  restartButton.addEventListener("click", resetGame);

  function handleSpotClick(e) {
    const spot = e.target;
    const index = parseInt(spot.id.replace("spot-", ""));

    // --- REMOVE MODE LOGIC ---
    if (removeMode) {
      if (board[index] === getOpponent(currentPlayer)) {
        // Prevent removing a piece that is part of an opponent's mill,
        // unless ALL of their pieces are in mills.
        if (checkMill(index, getOpponent(currentPlayer))) {
          const opponentPiecesNotInMill = Array.from(spots).filter((s, i) =>
            board[i] === getOpponent(currentPlayer) && !checkMill(i, getOpponent(currentPlayer))
          ).length;

          if (opponentPiecesNotInMill > 0) {
            statusEl.textContent = "❌ You must remove an opponent's piece NOT in a mill, if available.";
            return;
          }
        }

        board[index] = null;
        spot.classList.remove("player1", "player2");
        if (getOpponent(currentPlayer) === "player1") {
          player1PiecesOnBoard--;
        } else {
          player2PiecesOnBoard--;
        }

        millsToRemove--; // DECREMENT THE REMOVAL COUNT

        // Check if there are more pieces to remove from this mill formation
        if (millsToRemove > 0) {
            statusEl.textContent = `🎉 You formed another mill! Remove ${millsToRemove} more opponent piece(s).`;
            // Keep removeMode as true, and don't change player
        } else {
            removeMode = false; // All removals are done
            // Check for win condition immediately after removal (after final removal)
            if (checkWinCondition()) return;

            // Update game phase (will check for flying)
            checkGamePhase();

            currentPlayer = getOpponent(currentPlayer); // Opponent's turn after ALL removals
            updateStatus(); // Update status for the next player
        }
      } else {
        statusEl.textContent = "❌ You must remove an opponent's piece.";
      }
      return;
    }

    // --- PLACING PHASE LOGIC ---
    if (phase === "placing") {
      if (board[index]) {
        statusEl.textContent = "❌ That spot is already taken.";
        return;
      }

      if (piecesPlaced[currentPlayer] >= 9) {
        statusEl.textContent = `${capitalize(currentPlayer)} has placed all 9 pieces.`;
        return;
      }

      board[index] = currentPlayer;
      spot.classList.add(currentPlayer);
      piecesPlaced[currentPlayer]++;
      // Update pieces on board count
      if (currentPlayer === "player1") {
        player1PiecesOnBoard++;
      } else {
        player2PiecesOnBoard++;
      }

      let message = `${capitalize(currentPlayer)} placed at spot ${index}.`;

      const millsFormed = countMillsAtPosition(index, currentPlayer); // Use the new function
      if (millsFormed > 0) {
        let millMessage = `🎉 ${capitalize(currentPlayer)} formed a MILL!`;
        if (millsFormed > 1) {
            millMessage += ` You get to remove ${millsFormed} of your opponent's pieces!`;
        } else {
            millMessage += ` Remove one of your opponent's pieces.`;
        }
        removeMode = true;
        millsToRemove = millsFormed; // Store the number of removals granted
        statusEl.textContent = millMessage;
        return; // Stay on current player's turn for removal
      }

      // Check for phase change after placement, then for win condition
      checkGamePhase(); // This function now only updates 'phase', not status
      if (checkWinCondition()) return;

      currentPlayer = getOpponent(currentPlayer);
      updateStatus(message); // Update status with placement info + next player
      return;
    }

    // --- MOVING PHASE LOGIC ---
    if (phase === "moving") {
      if (selectedSpot === null) {
        if (board[index] === currentPlayer) {
          selectedSpot = index;
          spots[index].classList.add("selected");
          statusEl.textContent = `⚓ ${capitalize(currentPlayer)}, move piece from spot ${index}.`;
        } else if (board[index] === null) {
          statusEl.textContent = "Aye, pick one of yer own pieces to move!";
        } else {
          statusEl.textContent = "Shiver me timbers! That's not yer piece!";
        }
      } else {
        if (selectedSpot === index) { // Clicked the same spot, deselect
          spots[selectedSpot].classList.remove("selected");
          selectedSpot = null;
          updateStatus(); // Update status back to current player's turn
          return;
        }
         
        if (board[index] === null && isAdjacent(selectedSpot, index)) {
          board[index] = currentPlayer;
          board[selectedSpot] = null;

          spots[selectedSpot].classList.remove(currentPlayer, "selected");
          spot.classList.add(currentPlayer);

          let message = `${capitalize(currentPlayer)} moved from ${selectedSpot} to ${index}.`;

          const millsFormed = countMillsAtPosition(index, currentPlayer); // Use the new function
          if (millsFormed > 0) {
            let millMessage = `🎉 ${capitalize(currentPlayer)} formed a MILL!`;
            if (millsFormed > 1) {
                millMessage += ` You get to remove ${millsFormed} of your opponent's pieces!`;
            } else {
                millMessage += ` Remove one of your opponent's pieces.`;
            }
            removeMode = true;
            millsToRemove = millsFormed; // Store the number of removals granted
            statusEl.textContent = millMessage;
            // Do NOT change player, as they get another move (removal)
          } else {
            // After moving, check for phase change and win condition
            checkGamePhase();
            if (checkWinCondition()) return;
            currentPlayer = getOpponent(currentPlayer);
            updateStatus();
          }

          selectedSpot = null; // Reset selected spot
        } else {
          statusEl.textContent = "That be an invalid move, scallywag! Spot not empty or not adjacent.";
        }
      }
      return;
    }

    // --- FLYING PHASE LOGIC ---
    if (phase === "flying") {
      if (selectedSpot === null) {
        if (board[index] === currentPlayer) {
          selectedSpot = index;
          spots[index].classList.add("selected");
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
          updateStatus();
          return;
        }
        if (board[index] === null) { // Any empty spot is valid for flying
          board[index] = currentPlayer;
          board[selectedSpot] = null;

          spots[selectedSpot].classList.remove(currentPlayer, "selected");
          spot.classList.add(currentPlayer);

          let message = `${capitalize(currentPlayer)} flew from ${selectedSpot} to ${index}.`;

          const millsFormed = countMillsAtPosition(index, currentPlayer); // Use the new function
          if (millsFormed > 0) {
            let millMessage = `🎉 ${capitalize(currentPlayer)} formed a MILL!`;
            if (millsFormed > 1) {
                millMessage += ` You get to remove ${millsFormed} of your opponent's pieces!`;
            } else {
                millMessage += ` Remove one of your opponent's pieces.`;
            }
            removeMode = true;
            millsToRemove = millsFormed; // Store the number of removals granted
            statusEl.textContent = millMessage;
          } else {
            // After flying, check for phase change and win condition
            checkGamePhase();
            if (checkWinCondition()) return;
            currentPlayer = getOpponent(currentPlayer);
            updateStatus();
          }

          selectedSpot = null;
        } else {
          statusEl.textContent = "That spot be taken, scurvy dog! Find an empty one.";
        }
      }
      return;
    }
  }

  // Counts how many mills are formed involving a given position for a player
  function countMillsAtPosition(pos, player) {
    let millsDetected = 0;
    millCombos
      .filter(combo => combo.includes(pos)) // Filters for combos that *include* the piece at 'pos'
      .forEach(combo => {
        if (combo.every(i => board[i] === player)) {
         
          millsDetected++;
        }
      });
    return millsDetected;
  }

  function getOpponent(player) {
    return player === "player1" ? "player2" : "player1";
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

 function updateStatus(message = null) {
    let baseStatus = "";
    if (phase === "placing") {
        baseStatus = `${capitalize(currentPlayer)}'s turn to place.`;
    } else if (phase === "moving") {
        baseStatus = `${capitalize(currentPlayer)}'s turn to move.`;
    } else if (phase === "flying") {
        baseStatus = `🏴‍☠️ ${capitalize(currentPlayer)}'s turn to FLY!`; // added specific message for flying
    }
    statusEl.textContent = message ? `${message} ${baseStatus}` : baseStatus;
  }

 function checkGamePhase() { 
    
    if (piecesPlaced.player1 === 9 && piecesPlaced.player2 === 9) { 
      
      const p1Pieces = player1PiecesOnBoard;
      const p2Pieces = player2PiecesOnBoard;

      // Determines if either player has EXACTLY 3 pieces remaining
      const player1CanFly = (p1Pieces === 3);
      const player2CanFly = (p2Pieces === 3);

      // If either player has exactly 3 pieces (and the game hasn't ended, which checkWinCondition handles)
      // then the phase should be flying. Otherwise, it's moving.
      if (player1CanFly || player2CanFly) {
        phase = "flying";
      } else {
        phase = "moving";
      }
    }
  }

  function checkWinCondition() {
    const opponent = getOpponent(currentPlayer);
    // Use the explicitly tracked piece counts here for accuracy
    const opponentPieces = (opponent === "player1") ? player1PiecesOnBoard : player2PiecesOnBoard;

    // ONLY check for fewer than 3 pieces if ALL pieces have been placed
    if (piecesPlaced.player1 === 9 && piecesPlaced.player2 === 9) {
      if (opponentPieces < 3) {
        statusEl.textContent = `🏴‍☠️ ${capitalize(currentPlayer)} WINS! The ${capitalize(opponent)} has fewer than 3 pieces!`;
        disableBoardClicks();
        restartButton.style.display = "block";
        return true;
      }
    }

    // Checks if the opponent has any valid moves (only relevant in moving/flying phase)
    if (phase === "moving" || phase === "flying") {
      let hasValidMove = false;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === opponent) { // Checks each of opponent's pieces
          if (phase === "flying") {
            // If flying, and there's an empty spot, they can move 
            if (board.includes(null)) {
              hasValidMove = true;
              break;
            }
          } else { // Moving phase, check adjacent empty spots
            const possibleMoves = adjacencyList[i] || [];
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
        restartButton.style.display = "block";
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

  function resetGame() { 
    board.fill(null);
    spots.forEach(spot => {
      spot.classList.remove("player1", "player2", "selected");
      spot.addEventListener("click", handleSpotClick); // Re-added listeners
      spot.style.cursor = "pointer";
    });
    currentPlayer = "player1";
    phase = "placing";
    removeMode = false;
    piecesPlaced.player1 = 0;
    piecesPlaced.player2 = 0;
    player1PiecesOnBoard = 0;
    player2PiecesOnBoard = 0;
    selectedSpot = null;
    millsToRemove = 0;
    updateStatus();
    restartButton.style.display = "none";
  }

  updateStatus(); // Initial status update when the page loads
});







