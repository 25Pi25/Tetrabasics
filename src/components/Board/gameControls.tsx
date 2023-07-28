import { TSpinType, TetraColor, TetraminoType, tetraminoInfo } from '../../types';
import { Board, BoardCellInfo } from './Board';

export function resetBoard(this: Board) {
    this.cells.flat().forEach(cell => {
        cell.color = TetraColor.NONE;
        cell.isOccupied = false;
    })

    if (this.map) this.setMap(this.map)
    else {
        this.next = [];
        this.updateNext();
        this.activeTetramino.current?.getNextPiece();
        this.hold = { type: TetraminoType.NONE, used: false };
        this.whenConditions = [];
        this.setState({ cells: this.cells, next: this.next, hold: this.hold })
    }
    void this.startGame();
}

export function fillNextPieces(this: Board, next: string) {
    this.next = next.split("").map(x => x.toUpperCase() as TetraminoType ?? TetraminoType.T);
    this.setState({ next: this.next })
}

export function setMap(this: Board, map = "") {
    const [pieceMap, bagMap, holdPiece, boardWidth = 10, boardHeight = 20] = map.split("?");
    this.setDimensions(boardWidth as number, boardHeight as number)
    if (!pieceMap) return;
    for (let i = pieceMap.length - 1; i >= 0; i--) {
        const letter = pieceMap[i];
        if (!/[ljzstioLJZSTO#]/.test(letter)) continue;
        const inversePiece = pieceMap.length - i - 1;
        if (!this.cells[Math.floor(inversePiece / this.width)][this.width - 1 - (inversePiece % this.width)]) continue;
        this.cells[Math.floor(inversePiece / this.width)][this.width - 1 - (inversePiece % this.width)] = {
            color: letter == "#" ? TetraColor.GARBAGE :
                tetraminoInfo[letter.toUpperCase() as TetraminoType].color,
            isOccupied: true
        }
    }
    this.refillPieces = !bagMap;
    if (bagMap) this.fillNextPieces(bagMap);
    else this.updateNext();
    if (holdPiece && /[ljzstioLJZSTO]/.test(holdPiece[0])) this.hold = {
        type: holdPiece[0].toUpperCase() as TetraminoType ?? TetraminoType.NONE,
        used: false
    }
    else this.hold = { type: TetraminoType.NONE, used: false }
    const { current } = this.activeTetramino;
    if (current) {
        current.type = TetraminoType.NONE;
        current.getNextPiece();
    }
    this.setState({ cells: this.cells, hold: this.hold });
}

export function injectGarbage(this: Board, rows = 1, cheesePercent = 100) {
    this.cells.splice(this.cells.length - rows, rows);
    const newCells = Array.from({ length: rows }, () =>
        Array.from({ length: this.width }, () => ({
            color: TetraColor.GARBAGE,
            isOccupied: true,
            isMapCell: true
        }) as BoardCellInfo))
    let randomColumn = Math.floor(Math.random() * this.width);
    for (const row of newCells) {
        if (Math.random() * 100 < cheesePercent)
            randomColumn = Math.floor(Math.random() * this.width);
        row[randomColumn] = {
            color: TetraColor.NONE,
            isOccupied: false
        }
    }
    this.cells.unshift(...newCells);
    this.updateClearedLines();
    this.setState({ cells: this.cells });
}
// Updates the board to clear any lines that were potentially filled
export function updateClearedLines(this: Board, tSpinType = TSpinType.NONE) {
    let rowsCleared = 0;
    for (let i = 0; i < this.cells.length; i++) {
        const cellRow = this.cells[i];
        if (cellRow.some(cell => !cell.isOccupied)) continue;
        rowsCleared++;
        this.cells.splice(i, 1)
        this.cells.push(Array.from({ length: this.width }, () => ({
            color: TetraColor.NONE,
            isOccupied: false
        })));
        this.setState({ cells: this.cells });
        i--;
    }

    const { meta } = this;
    meta.height = this.height - [...this.cells].reverse().findIndex(cellRow => cellRow.some(cell => cell.isOccupied)) + 1
    meta.mapHeight = this.height - [...this.cells].reverse().findIndex(cellRow => cellRow.some(cell => cell.isMapCell))
    if (meta.mapHeight == this.height + 1) meta.mapHeight = 0;
    if (!rowsCleared) meta.combo = 0;
    else meta.combo++;
    if (this.cells.every(x => x.every(x => !x.isOccupied))) meta.allClear++;
    if (tSpinType == TSpinType.MINI) meta.tsm++;
    if (tSpinType == TSpinType.NONE && (rowsCleared > 0 && rowsCleared < 4)) meta.b2b = 0;
    else if (rowsCleared) meta.b2b++;
    switch (rowsCleared) {
        case 1:
            meta.single++;
            if (tSpinType == TSpinType.TSPIN) meta.tss++;
            break;
        case 2:
            meta.double++;
            if (tSpinType == TSpinType.TSPIN) meta.tsd++;
            break;
        case 3:
            meta.triple++;
            if (tSpinType == TSpinType.TSPIN) meta.tst++;
            break;
        case 4:
            meta.quad++;
            break;
    }
}

// Generates more pieces until the queue is filled
export function updateNext(this: Board) {
    if (!this.refillPieces) return;
    // TODO: Determine how many pieces far ahead the program should generate
    while (this.next.length < 14) {
        const shuffledPieces = "LJZSTIO".split("").sort(() => Math.random() - 0.5).map(x => x as TetraminoType);
        this.next.push(...shuffledPieces);
    }
    this.setState({ next: this.next });
}

export function gameOver(this: Board, win = false) {
    if (this.paused) return;
    this.setPaused(true);
    for (const row of this.cells) {
        for (const cell of row) {
            if (cell.isOccupied) cell.color = win ? TetraColor.GREEN : TetraColor.HELD;
        }
    }
    if (this.activeTetramino.current) this.activeTetramino.current.type = TetraminoType.NONE;
    this.setState({ cells: this.cells });
}

export function setDimensions(this: Board, width: number, height: number) {
    this.width = Math.min(Math.max(4, width), 20);
    this.height = Math.min(Math.max(4, height), 40) + Board.matrixBuffer;
    this.cells = Array.from({ length: this.height }, () =>
        Array.from({ length: this.width }, () => ({
            color: TetraColor.NONE,
            isOccupied: false
        })));
}