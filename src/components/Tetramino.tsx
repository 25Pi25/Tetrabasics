import { Sprite, Stage } from '@pixi/react';
import { Coordinate, TetraColor, TetraminoDirection, TetraminoType, WallKicks, tetraminoInfo } from '../types'
import { Point } from 'pixi.js';
import { getPieceOffset, getTexture } from '../util';
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
    direction: TetraminoDirection.UP;
    coords: Coordinate = { x: 4, y: 19 };
    type: TetraminoType;
    state: ActiveTetraminoState = {
        direction: TetraminoDirection.UP,
        coords: { x: 4, y: 19 },
        type: TetraminoType.J
    };

    constructor(props: ActiveTetraminoProps) {
        super(props);
        this.board = props.board;
        // TODO: Make this pull from queue
        this.direction = TetraminoDirection.UP;
        this.type = TetraminoType.L;
    }
    componentDidMount() {
        const { direction, coords, type } = this;
        this.setState({ direction, coords, type })
    }
    render() {
        if (this.state.type == TetraminoType.NONE) return null;
        const { pieceOffsets, color } = this.getTetraminoInfo()
        return pieceOffsets.map((offset, i) => {
            const [xOffset, yOffset] = getPieceOffset(this.state.direction, offset.x, offset.y)
            return <Sprite
                texture={getTexture(color)}
                scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
                x={Board.cellSize * this.getPieceX(xOffset)}
                y={Board.cellSize * (this.board.height - 21 - this.getPieceY(yOffset))}
                key={`cell ${i}`}
                roundPixels={true}
            />
        })
    }
    getTetraminoInfo = () => tetraminoInfo[this.type];
    getPieceX = (xOffset: number) => this.coords.x + xOffset + this.getTetraminoInfo().cursorOffset.x;
    getPieceY = (yOffset: number) => this.coords.y + yOffset + this.getTetraminoInfo().cursorOffset.y;

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
    move = (deltaX = 0, deltaY = 0, isCycled = false): boolean => {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const x = this.getPieceX(offset.x + deltaX);
            const y = this.getPieceY(offset.y + deltaY);
            if (x < 0 || y < 0) return false;
            if (x >= this.board.width || y >= this.board.height) return false;
            const destination = this.board.cells[y]?.[x]
            if (destination.current?.state.isOccupied) return false;
        }
        this.coords = { x: this.coords.x + deltaX, y: this.coords.y + deltaY }
        if (!isCycled) this.setState(() => ({ coords: this.coords }));
        return true;
    }

    // Place -> idk
    place = () => {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const thing = this.board.cells[this.getPieceY(offset.y)][this.getPieceX(offset.x)];
            const current = thing.current;
            if (!current) continue;
            current.isOccupied = true;
            current.setState({ isOccupied: true, color: this.getTetraminoInfo().color })
        }
        // TODO: Add snippet for checking lines cleared from the board
        this.getNextPiece()
    }

    getNextPiece = () => {
        // TODO: make it pull from the queue
        const enumValues = Object.values(TetraminoType);
        const randomEnum = enumValues[Math.floor(Math.random() * (enumValues.length - 1))];
        this.type = randomEnum;
        this.coords = { x: 4, y: 19 };
        this.setState({ type: this.type, coords: this.coords });
    }
}