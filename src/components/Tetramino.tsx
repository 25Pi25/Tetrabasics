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
    state: ActiveTetraminoState = {
        direction: TetraminoDirection.UP,
        coords: { x: 4, y: 19 },
        type: TetraminoType.J
    };

    constructor(props: ActiveTetraminoProps) {
        super(props);
        this.board = props.board;
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
    getTetraminoInfo = () => tetraminoInfo[this.state.type];
    getPieceX = (xOffset: number) => this.state.coords.x + xOffset + this.getTetraminoInfo().cursorOffset.x;
    getPieceY = (yOffset: number) => this.state.coords.y + yOffset + this.getTetraminoInfo().cursorOffset.y;

    // Control methods
    // Move -> returns a boolean based on execution being successful
    moveRight = () => this.move(1)
    moveLeft = () => this.move(-1)
    moveDown = () => this.move(0, -1)
    hardDrop = () => {
        if (!this.move(0, -1, this.hardDrop)) this.place();
        return true;
    }
    move = (deltaX = 0, deltaY = 0, callback?: (() => void) | undefined): boolean => {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const x = this.getPieceX(offset.x + deltaX);
            const y = this.getPieceY(offset.y + deltaY);
            if (x < 0 || y < 0) return false;
            if (x >= this.board.width || y >= this.board.height) return false;
            const destination = this.board.cells[y]?.[x]
            if (destination.current?.state.isOccupied) return false;
        }
        this.setState(({ coords: { x, y } }) => ({ coords: { x: x + deltaX, y: y + deltaY } }), callback);
        return true;
    }

    // Place -> idk
    place = () => {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const thing = this.board.cells[this.getPieceY(offset.y)][this.getPieceX(offset.x)];
            const current = thing.current;
            if (!current) continue;
            current.setState({ isOccupied: true, color: this.getTetraminoInfo().color })
        }
        // TODO: Add snippet for checking lines cleared from the board
        this.getNextPiece()
    }

    getNextPiece = () => {
        // TODO: make it pull from the queue
        const enumValues = Object.values(TetraminoType);
        const randomEnum = enumValues[Math.floor(Math.random() * (enumValues.length - 1))];
        this.setState({ type: randomEnum, coords: { x: 4, y: 19 } });
    }
}