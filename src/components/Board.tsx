import { Stage } from '@pixi/react';
import './Board.css';
import { Component, RefObject, createRef } from 'react';
import { TetraColor, TetraminoType, tetraminoInfo } from '../types';
import ActiveTetramino from './ActiveTetramino';
import TetraminoDisplay from './TetraminoDisplay';
import BoardCell from './BoardCell';

interface BoardCellInfo {
    color: TetraColor;
    isOccupied: boolean;
}

type BoardProps = {
    width?: number,
    height?: number,
    map?: string,
}
type BoardState = {
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
        this.updateNext();
        this.setPaused(false);
    }
    componentWillUnmount() {
        this.setPaused(true);
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
        </div>
    }

    // Input controls
    // Controls
    paused = true;
    keyPresses: Partial<Record<string, number>> = {};
    setPaused(paused: boolean) {
        const isPaused = this.paused;
        this.paused = paused;

        if (isPaused && !paused) {
            addEventListener("keydown", this.handleKeyDown);
            addEventListener("keyup", this.handleKeyUp);
            addEventListener("keypress", this.handlePress);
        } else if (paused) {
            removeEventListener("keydown", this.handleKeyDown);
            removeEventListener("keyup", this.handleKeyUp);
            removeEventListener("keypress", this.handlePress);
        }
        console.log(paused)
    }
    handleKeyDown = ({ key }: KeyboardEvent) => {
        const ARR = 0;
        const DAS = 100;
        const SDF = -1;
        const activeMino = this.activeTetramino.current;
        const { controlEvents, controlEvents: { left, right } } = this;
        if (!activeMino) return;
        if (key == 'a') {
            if (left.das) return;
            this.clearShiftRepeat(left);
            this.clearShiftRepeat(right);
            activeMino.moveLeft();
            left.das = setTimeout(() => {
                activeMino.moveLeft();
                left.delay = setInterval(() => !this.paused && activeMino.moveLeft(), ARR);
            }, DAS);
        }
        if (key == 'd') {
            if (right.das) return;
            this.clearShiftRepeat(left);
            this.clearShiftRepeat(right);
            activeMino.moveRight();
            right.das = setTimeout(() => {
                activeMino.moveRight();
                right.delay = setInterval(() => !this.paused && activeMino.moveRight(), ARR);
            }, DAS);
        }
        if (key == 's') {
            if (controlEvents.down) return;
            activeMino.moveDown();
            if (SDF != -1) controlEvents.down = setInterval(() => !this.paused && activeMino.moveDown(), 500 / SDF);
            else controlEvents.down = setInterval(() => !this.paused && activeMino.hardDrop(false), 0);
        }
    }
    handleKeyUp = ({ key }: KeyboardEvent) => {
        const { controlEvents, controlEvents: { left, right } } = this;
        if (key == 'a') this.clearShiftRepeat(left);
        if (key == 'd') this.clearShiftRepeat(right);
        if (key == 's') {
            if (controlEvents.down) clearInterval(controlEvents.down);
            controlEvents.down = null;
        }
    }
    handlePress = ({ key }: KeyboardEvent) => {
        if (key == "w") this.activeTetramino.current?.hardDrop();
        else if (key == "3") this.activeTetramino.current?.rotateRight();
        else if (key == "2") this.activeTetramino.current?.rotateLeft();
        else if (key == "5") this.activeTetramino.current?.rotate180();
        else if (key == "6") this.activeTetramino.current?.hold();
        else if (key == "r") this.resetBoard();
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

    // Updates the board to clear any lines that were potentially filled
    updateClearedLines = () => {
        for (let i = 0; i < this.cells.length; i++) {
            const cellRow = this.cells[i];
            if (cellRow.some(cell => !cell.isOccupied)) continue;
            this.cells.splice(i, 1)
            this.cells.push(Array.from({ length: this.width }, () => ({
                color: TetraColor.NONE,
                isOccupied: false
            })));
            this.setState({ cells: this.cells });
            i--;
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
}

