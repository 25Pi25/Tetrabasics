import { Rectangle, Texture, Point, BaseTexture } from 'pixi.js';
import { Stage, Sprite } from '@pixi/react';

import './Board.css';
import { Component, RefObject, createRef } from 'react';
import { Coordinate, TetraColor, TetraminoDirection, } from '../types';
import { ActiveTetramino, Tetramino } from './Tetramino';
import { getTexture } from '../util';

type BoardProps = {
    width?: number,
    height?: number,
    map?: string,
    queue?: string
    cellSize?: number
}
export class Board extends Component<BoardProps> {
    static cellSize: number;
    activeTetramino: RefObject<ActiveTetramino>;
    width: number;
    height: number;
    cells: RefObject<BoardCell>[][];
    hold: { tetramino: Tetramino | null, holdUsed: boolean };
    queue: (Tetramino | null)[]

    constructor(props: BoardProps) {
        super(props);
        const { width = 10, height = 20, map, queue, cellSize = 35 } = props;
        this.activeTetramino = createRef<ActiveTetramino>()
        this.width = Math.min(Math.max(4, width), 20);
        this.height = Math.min(Math.max(4, height), 40) + 20;
        // TODO: Add functionality for queue/hold
        this.hold = { tetramino: null, holdUsed: false };
        this.queue = [null];
        Board.cellSize = cellSize;
        this.cells = Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => createRef<BoardCell>()));
    }
    render() {
        return <Stage className='board' width={this.width * Board.cellSize} height={(this.height - 20) * Board.cellSize}>
            {Array.from({ length: (this.height - 20) }, (_, y) =>
                Array.from({ length: this.width }, (_, x) =>
                    <BoardCell board={this} coords={{ x, y }} key={`${x} ${y}`} ref={this.cells[y][x]} />))}
            <ActiveTetramino board={this} ref={this.activeTetramino} />
        </Stage>
    }
}

interface BoardCellProps {
    board: Board;
    coords: Coordinate;
    color?: TetraColor;
    isOccupied?: boolean;
}
interface BoardCellState {
    color: TetraColor;
    isOccupied: boolean;
}
class BoardCell extends Component<BoardCellProps, BoardCellState> {
    board: Board;
    coords: Coordinate;
    state = {
        color: TetraColor.NONE,
        isOccupied: false
    }
    constructor(props: BoardCellProps) {
        super(props);
        const { board, coords, color, isOccupied } = props;
        this.board = board;
        this.coords = coords;
    }
    render() {
        return <Sprite
            texture={getTexture(this.state.color)}
            scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
            alpha={this.state.isOccupied ? 1 : 0.5}
            x={this.coords.x * Board.cellSize}
            y={Board.cellSize * (this.board.height - 21 - this.coords.y)}
            key={`cell ${this.coords.x} ${this.coords.y}`}
        />
    }
}

