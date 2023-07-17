import { Sprite, Stage } from '@pixi/react';
import { Coordinate, TetraColor, TetraminoDirection, TetraminoType, WallKicks, tetraminoInfo } from '../types'
import { Point } from 'pixi.js';
import { getDirectionOffset, getTexture } from '../util';
import { Component } from 'react';
import { Board } from './Board';

interface TetraminoDisplayProps {
    type: TetraminoType;
    width?: number;
    height?: number;
    scale?: number;
}

export interface Tetramino {
    color: TetraColor;
    cursorOffset: Coordinate;
    pieceOffsets: Coordinate[];
}

// Used for the hold/next queue to display pieces that don't interact with the board, has a scalable canvas
export default function TetraminoDisplay({ type, width = 125, height = 125, scale = 1 }: TetraminoDisplayProps) {

    scale = scale * Math.min(width, height) / 120;
    const middleY = type == TetraminoType.O ? 0 : 0.5;
    const { pieceOffsets, color } = tetraminoInfo[type];
    return <Stage width={width} height={height}>
        {type != TetraminoType.NONE && pieceOffsets.map((offset, i) => {
            return <Sprite
                texture={getTexture(color)}
                scale={new Point(scale, scale)}
                x={scale * ((offset.x * 30) - 15) + width / 2}
                y={scale * ((offset.y - middleY) * -30 - 15) + height / 2}
                key={`cell ${i}`}
                roundPixels={true}
            />
        })}
    </Stage>
}

interface ActiveTetraminoProps {
    board: Board;
}
interface ActiveTetraminoState {
    direction: TetraminoDirection
    coords: Coordinate;
    type: TetraminoType;
}
export class ActiveTetramino extends Component<ActiveTetraminoProps, ActiveTetraminoState> {
    board: Board;
    direction: TetraminoDirection;
    coords: Coordinate = { x: 4, y: 19 };
    type: TetraminoType;
    state: ActiveTetraminoState = {
        direction: TetraminoDirection.UP,
        coords: { x: 4, y: 19 },
        type: TetraminoType.NONE
    };

    constructor(props: ActiveTetraminoProps) {
        super(props);
        this.board = props.board;
        // TODO: Make this pull from queue
        this.direction = TetraminoDirection.UP;
        this.type = TetraminoType.T;
    }
    componentDidMount() {
        const { direction, coords, type } = this;
        this.setState({ direction, coords, type })
    }
    render() {
        if (this.state.type == TetraminoType.NONE) return null;
        const { pieceOffsets, color } = this.getTetraminoInfo()
        return pieceOffsets.map((offset, i) => {
            const [x, y] = this.getPieceCoords(offset)
            return <Sprite
                texture={getTexture(color)}
                scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
                x={Board.cellSize * x}
                y={Board.cellSize * (this.board.height - (Board.matrixBuffer - Board.matrixVisible + 1) - y)}
                key={`cell ${i}`}
                roundPixels={true}
            />
        })
    }
    getTetraminoInfo = () => tetraminoInfo[this.type];
    // Gets the absolute x/y position on the board for a specific piece
    getPieceCoords(offset: Coordinate): [number, number] {
        const [xOffset, yOffset] = getDirectionOffset(this.direction, offset);
        return [
            this.coords.x + xOffset + this.getTetraminoInfo().cursorOffset.x,
            this.coords.y + yOffset + this.getTetraminoInfo().cursorOffset.y
        ]
    }

    // Control methods
    // Move -> returns a boolean based on execution being successful
    moveRight = () => this.move(1)
    moveLeft = () => this.move(-1)
    moveDown = () => this.move(0, -1)
    hardDrop = () => {
        for (let i = 0; i < 100; i++) {
            if (!this.move(0, -1, true)) break;
        }
        this.setState(() => ({ coords: this.coords }));
        this.place();
    }
    move(deltaX = 0, deltaY = 0, isCycled = false): boolean {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const [initialX, initialY] = this.getPieceCoords(offset);
            const [x, y] = [initialX + deltaX, initialY + deltaY]
            if (x < 0 || y < 0) return false;
            if (x >= this.board.width || y >= this.board.height) return false;
            const destination = this.board.cells[y]?.[x]
            if (destination.isOccupied) return false;
        }
        this.coords = { x: this.coords.x + deltaX, y: this.coords.y + deltaY }
        if (!isCycled) this.setState(() => ({ coords: this.coords }));
        return true;
    }

    // Rotate -> idk
    rotateRight = () => this.rotate(1)
    rotateLeft = () => this.rotate(-1)
    rotate(direction: number) {
        const oldDirection = this.direction
        const newDirection: TetraminoDirection = (this.direction + direction + 4) % 4;
        this.direction = newDirection;
        this.setState({ direction: this.direction })
        if (!this.move(0, 0)) this.direction = oldDirection;
    }

    // Place -> idk
    place = () => {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const [x, y] = this.getPieceCoords(offset);
            const cellTarget = this.board.cells[y][x];
            if (!cellTarget) continue;
            cellTarget.isOccupied = true;
            cellTarget.color = this.getTetraminoInfo().color;
            this.board.setState(prevState => ({ ...prevState, cells: this.board.cells }));
    }
        this.board.updateClearedLines();
this.getNextPiece()
    }
getNextPiece = () => {
    // TODO: make it pull from the queue
    const enumValues = Object.values(TetraminoType);
    const randomEnum = enumValues[Math.floor(Math.random() * (enumValues.length - 1))];
    this.type = randomEnum;
    this.direction = TetraminoDirection.UP;
    this.coords = { x: 4, y: 19 };
    const { type, direction, coords } = this;
    this.setState({ type, direction, coords });
}
}