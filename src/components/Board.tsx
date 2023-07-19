import { Stage } from '@pixi/react';
import './Board.css';
import { Component, RefObject, createRef } from 'react';
import { TSpinType, TetraColor, TetraminoType, tetraminoInfo } from '../types';
import ActiveTetramino from './ActiveTetramino';
import TetraminoDisplay from './TetraminoDisplay';
import BoardCell from './BoardCell';
import DynamicContentComponent from './CommandEditor';

// TODO: add finesse faults??
interface BoardMeta {
    pieces: number,
    keys: number,
    holds: number,
    lines: number,
    attack: number,
    b2b: number,
    time: number,
    combo: number,
    finesseFaults: number,
    clears: {
        single: number,
        double: number,
        triple: number,
        quad: number,
        tsm: number,
        tss: number,
        tsd: number,
        tst: number,
        allClear: number
    }
}

interface BoardCellInfo {
    color: TetraColor;
    isOccupied: boolean;
}

interface BoardProps {
    width?: number,
    height?: number,
    map?: string,
}
interface BoardState {
    cells: BoardCellInfo[][];
    next: TetraminoType[];
    hold: { type: TetraminoType, used: boolean }
}
export class Board extends Component<BoardProps, BoardState> {
    static cellSize = 30;
    static matrixBuffer = 20;
    static matrixVisible = 3;
    activeTetramino: RefObject<ActiveTetramino>;
    width: number;
    height: number;
    cells: BoardCellInfo[][] = [[]];
    map: string;
    meta: BoardMeta = {
        pieces: 0,
        keys: 0,
        holds: 0,
        lines: 0,
        attack: 0,
        b2b: 0,
        time: 0,
        combo: 0,
        finesseFaults: 0,
        clears: {
            single: 0,
            double: 0,
            triple: 0,
            quad: 0,
            tsm: 0,
            tss: 0,
            tsd: 0,
            tst: 0,
            allClear: 0
        }
    }

    hold: { type: TetraminoType, used: boolean } = { type: TetraminoType.NONE, used: false }
    next: TetraminoType[] = [];
    state: BoardState = { cells: this.cells, next: this.next, hold: this.hold };
    constructor(props: BoardProps) {
        super(props);
        const { width = 10, height = 20, map = "" } = props;
        this.activeTetramino = createRef<ActiveTetramino>()
        this.width = Math.min(Math.max(4, width), 20);
        this.height = Math.min(Math.max(4, height), 40) + Board.matrixBuffer;
        this.cells = Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => ({
                color: TetraColor.NONE,
                isOccupied: false
            })));
        this.map = map;
    }
    componentDidMount() {
        this.setState({ cells: this.cells });
        // TODO: Run conditional if the board disables new next pieces
        this.setMap(this.map);
    }
    render() {
        const renderedHeight = this.height - Board.matrixBuffer + Board.matrixVisible;
        return <div className='game'>
            <TetraminoDisplay width={100} height={100} type={this.state.hold.type} overrideColor={this.state.hold.used ? TetraColor.HELD : undefined} />
            <Stage className='board'
                width={this.width * Board.cellSize}
                height={renderedHeight * Board.cellSize}>
                {this.cells
                    .filter((_, i) => i <= renderedHeight)
                    .map((arr, y) => arr.map(({ color, isOccupied }, x) => {
                        return <BoardCell board={this} coords={{ x, y }} isOccupied={isOccupied} color={color} key={`${x} ${y}`} />;
                    }))}
                <ActiveTetramino board={this} ref={this.activeTetramino} />
            </Stage>
            <div className='next'>
                {Array.from({ length: 5 }, (_, i) => {
                    return <TetraminoDisplay width={i ? 75 : 100} height={i ? 75 : 100} type={this.state.next[i]} key={i} />
                })}
            </div>
            <DynamicContentComponent />
        </div>
    }
    // Start game -> I mean this is pretty self-explanatory
    startGame() {
        this.setPaused(false);
        this.updateNext();
        const { current } = this.activeTetramino;
        if (!current) return;
        current.getNextPiece();
        const { direction, coords, type } = current;
        current.setState({ direction, coords, type })
    }

    // Input controls
    // Controls
    paused = true;
    keyPresses: Set<string> = new Set<string>();
    setPaused(paused: boolean) {
        const isPaused = this.paused;
        this.paused = paused;

        if (isPaused && !paused) {
            addEventListener("keydown", this.handleKeyDown);
            addEventListener("keyup", this.handleKeyUp);
        } else if (paused) {
            removeEventListener("keydown", this.handleKeyDown);
            removeEventListener("keyup", this.handleKeyUp);
            this.keyPresses = new Set<string>();
        }
    }
    handleKeyDown = ({ key }: KeyboardEvent) => {
        if (this.keyPresses.has(key)) return;
        this.keyPresses.add(key);

        const ARR = 0;
        const DAS = 100;
        const SDF = -1;
        const activeMino = this.activeTetramino.current;
        const { controlEvents, controlEvents: { left, right } } = this;
        if (!activeMino) return;
        switch (key) {
            case "a":
                if (left.das) return;
                this.clearShiftRepeat(left);
                this.clearShiftRepeat(right);
                activeMino.moveLeft();
                left.das = setTimeout(() => {
                    activeMino.moveLeft();
                    left.delay = setInterval(() => !this.paused && activeMino.moveLeft(), ARR);
                }, DAS);
                break;
            case "d":
                if (right.das) return;
                this.clearShiftRepeat(left);
                this.clearShiftRepeat(right);
                activeMino.moveRight();
                right.das = setTimeout(() => {
                    activeMino.moveRight();
                    right.delay = setInterval(() => !this.paused && activeMino.moveRight(), ARR);
                }, DAS);
                break;
            case "s":
                if (controlEvents.down) return;
                activeMino.moveDown();
                if (SDF != -1) controlEvents.down = setInterval(() => !this.paused && activeMino.moveDown(), 500 / SDF);
                else controlEvents.down = setInterval(() => !this.paused && activeMino.hardDrop(false), 0);
                break;
            case "w":
                this.activeTetramino.current?.hardDrop();
                break;
            case "3":
                this.activeTetramino.current?.rotateRight();
                break;
            case "2":
                this.activeTetramino.current?.rotateLeft();
                break;
            case "5":
                this.activeTetramino.current?.rotate180();
                break;
            case "6":
                this.activeTetramino.current?.hold();
                break;
        }
    }
    handleKeyUp = ({ key }: KeyboardEvent) => {
        this.keyPresses.delete(key);
        const { controlEvents, controlEvents: { left, right } } = this;
        if (key == 'a') this.clearShiftRepeat(left);
        if (key == 'd') this.clearShiftRepeat(right);
        if (key == 's') {
            if (controlEvents.down) clearInterval(controlEvents.down);
            controlEvents.down = null;
        }
    }
    controlEvents: {
        left: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null },
        right: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null },
        down: ReturnType<typeof setInterval> | null
    } = { left: { das: null, delay: null }, right: { das: null, delay: null }, down: null }
    clearShiftRepeat(eventDirection: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null }) {
        if (eventDirection.das) {
            clearTimeout(eventDirection.das);
            eventDirection.das = null;
        }
        if (eventDirection.delay) {
            clearTimeout(eventDirection.delay);
            eventDirection.delay = null;
        }
    }

    // Control methods
    resetBoard() {
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

    fillNextPieces(next: string) {
        this.next = next.split("").map(x => x.toUpperCase() as TetraminoType ?? TetraminoType.T);
        this.setState({ next: this.next })
    }

    setMap(map: string) {
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

    injectGarbage(rows = 1, cheesePercent = 100) {
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
    updateClearedLines(tSpinType = TSpinType.NONE) {
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

        const { meta, meta: { clears } } = this;
        if (!rowsCleared) meta.combo = 0;
        else meta.combo++;
        if (this.cells.every(x => x.every(x => !x.isOccupied))) clears.allClear++;
        if (tSpinType == TSpinType.MINI) clears.tsm++;
        if (tSpinType == TSpinType.NONE && (rowsCleared > 0 && rowsCleared < 4)) meta.b2b = 0;
        else if (rowsCleared) meta.b2b++;
        switch (rowsCleared) {
            case 1:
                clears.single++;
                if (tSpinType == TSpinType.TSPIN) clears.tss++;
                break;
            case 2:
                clears.double++;
                if (tSpinType == TSpinType.TSPIN) clears.tsd++;
                break;
            case 3:
                clears.triple++;
                if (tSpinType == TSpinType.TSPIN) clears.tst++;
                break;
            case 4:
                clears.quad++;
                break;
        }
    }

    // Generates more pieces until the queue is filled
    updateNext() {
        // TODO: Determine how many pieces far ahead the program should generate
        while (this.next.length < 14) {
            const shuffledPieces = "LJZSTIO".split("").sort(() => Math.random() - 0.5).map(x => x as TetraminoType);
            this.next.push(...shuffledPieces);
        }
        this.setState({ next: this.next });
    }

    gameOver() {
        this.setPaused(true);
        for (const row of this.cells) {
            for (const cell of row) {
                if (cell.isOccupied) cell.color = TetraColor.HELD;
            }
        }
        if (this.activeTetramino.current) this.activeTetramino.current.type = TetraminoType.NONE;
    }
}

