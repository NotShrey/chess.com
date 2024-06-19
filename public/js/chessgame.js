const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceElement.innerHTML = getPieceUnicode(square.type, square.color);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", () => {
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });
    if(playerRole === 'b'){
        boardElement.classList.add("flipped")
    }
    else{
        boardElement.classList.remove("flipped")
    }
};

const handleMove = (sourceSquare, targetSquare) => {
    const source = String.fromCharCode(97 + sourceSquare.col) + (8 - sourceSquare.row);
    const target = String.fromCharCode(97 + targetSquare.col) + (8 - targetSquare.row);
    const move = chess.move({ from: source, to: target });

    if (move) {
        socket.emit("move", move);
        renderBoard();
    } else {
        alert("Invalid move");
    }
};

const getPieceUnicode = (type, color) => {
    const unicodePieces = {
        'w': {
            'k': '&#9812;', // white king ♔
            'q': '&#9813;', // white queen ♕
            'r': '&#9814;', // white rook ♖
            'b': '&#9815;', // white bishop ♗
            'n': '&#9816;', // white knight ♘
            'p': '&#9817;', // white pawn ♙
        },
        'b': {
            'k': '&#9818;', // black king ♚
            'q': '&#9819;', // black queen ♛
            'r': '&#9820;', // black rook ♜
            'b': '&#9821;', // black bishop ♝
            'n': '&#9822;', // black knight ♞
            'p': '&#9823;', // black pawn ♟︎
        }
    };
    return unicodePieces[color][type];
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

renderBoard();
