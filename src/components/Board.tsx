import { Point } from 'pixi.js';
import { Stage, Sprite } from '@pixi/react';

import './Board.css';
import { Component, RefObject, createRef, useEffect, useState } from 'react';
import { Coordinate, TetraColor, TetraminoType } from '../types';
import TetraminoDisplay, { ActiveTetramino } from './Tetramino';
import { getTexture } from '../util';

interface BoardCellInfo {
    color: TetraColor;
    isOccupied: boolean;
}

type BoardProps = {
    width?: number,
    height?: number,
    map?: string,
    next?: string
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

    hold: { type: TetraminoType, used: boolean } = { type: TetraminoType.NONE, used: false }
    next: TetraminoType[] = [];
    state: BoardState = { cells: this.cells, next: this.next, hold: this.hold };
    constructor(props: BoardProps) {
        super(props);
        const { width = 10, height = 20, map, next = "" } = props;
        this.activeTetramino = createRef<ActiveTetramino>()
        this.width = Math.min(Math.max(4, width), 20);
        this.height = Math.min(Math.max(4, height), 40) + Board.matrixBuffer;
        // TODO: Add functionality for queue/hold
        this.next = next.split("").map(x => x as TetraminoType ?? TetraminoType.T);
        this.cells = Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => ({
                color: TetraColor.NONE,
                isOccupied: false
            })));
    }
    componentDidMount() {
        this.setState({ cells: this.cells });
        // TODO: Run conditional if the board disables new next pieces
        this.updateNext();
        this.setPaused(false);
    }
    componentWillUnmount() {
        this.setPaused(true);
    }
    // Controls
    paused = true;
    keyPresses: Partial<Record<string, number>> = {};
    setPaused(paused: boolean) {
        const isPaused = this.paused;
        this.paused = isPaused;

        if (isPaused && !paused) {
            addEventListener("keydown", this.handleKeyDown);
            addEventListener("keyup", this.handleKeyUp);
            addEventListener("keypress", this.handlePress);
        } else {
            removeEventListener("keydown", this.handleKeyDown);
            removeEventListener("keyup", this.handleKeyUp);
            removeEventListener("keypress", this.handlePress);
        }
    }
    handlePress = ({ key }: KeyboardEvent) => {
        if (key == "w") this.activeTetramino.current?.hardDrop();
        else if (key == "3") this.activeTetramino.current?.rotateRight();
        else if (key == "2") this.activeTetramino.current?.rotateLeft();
        else if (key == "5") this.activeTetramino.current?.rotate180();
        else if (key == "6") this.activeTetramino.current?.hold();
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
    handleKeyDown = ({ key }: KeyboardEvent) => {
        const ARR = 0;
        const DAS = 90;
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
                left.delay = setInterval(activeMino.moveLeft, ARR);
            }, DAS);
        }
        if (key == 'd') {
            if (right.das) return;
            this.clearShiftRepeat(left);
            this.clearShiftRepeat(right);
            activeMino.moveRight();
            right.das = setTimeout(() => {
                activeMino.moveRight();
                right.delay = setInterval(activeMino.moveRight, ARR);
            }, DAS);
        }
        if (key == 's') {
            if (controlEvents.down) return;
            activeMino.moveDown();
            if (SDF != -1) controlEvents.down = setInterval(activeMino.moveDown, 500 / SDF);
            else controlEvents.down = setInterval(() => activeMino.hardDrop(false), 0);
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

    // Control methods
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

interface BoardCellProps {
    board: Board;
    coords: Coordinate;
    isOccupied: boolean;
    color: TetraColor;
}
interface BoardCellState {
    coords: Coordinate;
    isOccupied: boolean;
    color: TetraColor;
}
function BoardCell({ board, coords, isOccupied, color }: BoardCellProps) {
    const [state, setState] = useState<BoardCellState>({ coords, isOccupied, color });

    useEffect(() => {
        setState({ coords, isOccupied, color });
    }, [coords, isOccupied, color]);

    return <Sprite
        texture={getTexture(state.color, state.coords.y)}
        scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
        alpha={state.isOccupied ? 1 : 0.5}
        x={state.coords.x * Board.cellSize}
        y={Board.cellSize * (board.height - (Board.matrixBuffer - Board.matrixVisible + 1) - state.coords.y)}
        key={`cell ${state.coords.x} ${state.coords.y}`}
    />
}