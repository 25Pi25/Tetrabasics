import { Rectangle, Texture, Point, BaseTexture } from 'pixi.js';
import { Stage, Sprite } from '@pixi/react';

import './Board.css';
import { Component, RefObject, createRef } from 'react';
import { Coordinate, TetraColor, TetraminoDirection, TetraminoType, } from '../types';
import { ActiveTetramino, Tetramino } from './Tetramino';
import { getTexture } from '../util';

interface BoardCellInfo {
    color: TetraColor;
    isOccupied: boolean;
}

type BoardProps = {
    width?: number,
    height?: number,
    map?: string,
    queue?: string
}
type BoardState = {
    cells: BoardCellInfo[][];
}
export class Board extends Component<BoardProps, BoardState> {
    static cellSize = 30;
    static matrixBuffer = 20;
    static matrixVisible = 3;
    activeTetramino: RefObject<ActiveTetramino>;
    width: number;
    height: number;
    cells: BoardCellInfo[][];
    hold: { tetramino: Tetramino | null, holdUsed: boolean };
    queue: TetraminoType[]
    state: BoardState = { cells: [[]] }
    constructor(props: BoardProps) {
        super(props);
        const { width = 10, height = 20, map, queue } = props;
        this.activeTetramino = createRef<ActiveTetramino>()
        this.width = Math.min(Math.max(4, width), 20);
        this.height = Math.min(Math.max(4, height), 40) + Board.matrixBuffer;
        // TODO: Add functionality for queue/hold
        this.hold = { tetramino: null, holdUsed: false };
        this.queue = [TetraminoType.NONE];
        this.cells = Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => ({
                color: TetraColor.NONE,
                isOccupied: false
            })));
    }
    componentDidMount() {
        this.setState({ cells: this.cells })
    }
    render() {
        const renderedHeight = this.height - Board.matrixBuffer + Board.matrixVisible;
        return <Stage className='board'
            width={this.width * Board.cellSize}
            height={renderedHeight * Board.cellSize}>
            {this.cells
                .filter((_, i) => i <= renderedHeight)
                .map((arr, y) => arr.map(({ color, isOccupied }, x) => {
                    return <BoardCell board={this} coords={{ x, y }} isOccupied={isOccupied} color={color} key={`${x} ${y}`} />;
                }))}
            <ActiveTetramino board={this} ref={this.activeTetramino} />
        </Stage>
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
            this.setState({ cells: this.cells })
        }
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
class BoardCell extends Component<BoardCellProps, BoardCellState> {
    board: Board;
    state: BoardCellState;
    constructor(props: BoardCellProps) {
        super(props);
        const { board, coords, isOccupied, color } = props;
        this.board = board;
        this.state = { coords, isOccupied, color };
    }
    componentDidUpdate(prevProps: BoardCellProps) {
        if (this.props.coords === prevProps.coords &&
            this.props.isOccupied === prevProps.isOccupied &&
            this.props.color === prevProps.color) return;
        this.setState({
            coords: this.props.coords,
            isOccupied: this.props.isOccupied,
            color: this.props.color,
        });
    }
    render() {
        return <Sprite
            texture={getTexture(this.state.color, this.state.coords.y)}
            scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
            alpha={this.state.isOccupied ? 1 : 0.5}
            x={this.state.coords.x * Board.cellSize}
            y={Board.cellSize * (this.board.height - (Board.matrixBuffer - Board.matrixVisible + 1) - this.state.coords.y)}
            key={`cell ${this.state.coords.x} ${this.state.coords.y}`}
        />
    }
}

