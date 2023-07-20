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
        this.hold = { type: TetraminoType.NONE, used: false }
        this.setState({ cells: this.cells, next: this.next, hold: this.hold })
    }
}

export function fillNextPieces(this: Board, next: string) {
    this.next = next.split("").map(x => x.toUpperCase() as TetraminoType ?? TetraminoType.T);
    this.setState({ next: this.next })
}

export function setMap(this: Board, map: string) {
    const [pieceMap, bagMap, holdPiece] = map.split("?");
    if (!pieceMap) return;
    for (let i = pieceMap.length - 1; i >= 0; i--) {
        const letter = pieceMap[i];
        if (!/[ljzstioLJZSTO]/.test(letter)) continue;
        const inversePiece = pieceMap.length - i - 1;
        if (!this.cells[Math.floor(inversePiece / this.width)][inversePiece % this.width]) continue;
        this.cells[Math.floor(inversePiece / this.width)][inversePiece % this.width] = {
            color: tetraminoInfo[letter.toUpperCase() as TetraminoType].color,
            isOccupied: true
        }
    }
    this.fillNextPieces(bagMap || "");
    if (/[ljzstioLJZSTO]/.test(holdPiece[0])) this.hold = {
        type: holdPiece[0].toUpperCase() as TetraminoType ?? TetraminoType.NONE,
        used: false
    }
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
            isOccupied: true
        }) as BoardCellInfo))
    let randomColumn = Math.floor(Math.random() * this.width);
    for (const row of newCells) {
        if (Math.random() * 100 >= cheesePercent)
            randomColumn = Math.floor(Math.random() * this.width);
        row[randomColumn] = {
            color: TetraColor.NONE,
            isOccupied: false
        }
    }
    this.cells.unshift(...newCells);
    this.setState({ cells: this.cells })
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
    // TODO: Determine how many pieces far ahead the program should generate
    while (this.next.length < 14) {
        const shuffledPieces = "LJZSTIO".split("").sort(() => Math.random() - 0.5).map(x => x as TetraminoType);
        this.next.push(...shuffledPieces);
    }
    this.setState({ next: this.next });
}

export function gameOver(this: Board) {
    this.setPaused(true);
    for (const row of this.cells) {
        for (const cell of row) {
            if (cell.isOccupied) cell.color = TetraColor.HELD;
        }
    }
    if (this.activeTetramino.current) this.activeTetramino.current.type = TetraminoType.NONE;
}