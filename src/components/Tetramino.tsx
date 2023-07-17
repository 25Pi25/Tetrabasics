import { Sprite, Stage } from '@pixi/react';
import { Coordinate, TetraColor, TetraminoDirection, TetraminoType, flipKickTable, iKickTable, mainKickTable, tetraminoInfo } from '../types'
import { Point } from 'pixi.js';
import { getDirectionOffset, getTexture } from '../util';
import { Component, Fragment } from 'react';
import { Board } from './Board';

interface TetraminoDisplayProps {
    type?: TetraminoType;
    width?: number;
    height?: number;
    scale?: number;
    overrideColor?: TetraColor;
}

export interface Tetramino {
    color: TetraColor;
    cursorOffset: Coordinate;
    pieceOffsets: Coordinate[];
}

// Used for the hold/next queue to display pieces that don't interact with the board, has a scalable canvas
export default function TetraminoDisplay({ type = TetraminoType.NONE, width = 125, height = 125, scale = 1, overrideColor }: TetraminoDisplayProps) {
    scale = scale * Math.min(width, height) / 120;
    const middleY = type == TetraminoType.O ? 0 : 0.5;
    const { pieceOffsets, color } = tetraminoInfo[type];
    return <Stage width={width} height={height}>
        {type != TetraminoType.NONE && pieceOffsets.map((offset, i) => {
            return <Sprite
                texture={overrideColor != null ? getTexture(overrideColor) : getTexture(color)}
                scale={new Point(scale, scale)}
                x={scale * ((offset.x * 30) - 15) + width / 2}
                y={scale * ((offset.y - middleY) * -30 - 15) + height / 2}
                key={`display ${i}`}
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
    direction: TetraminoDirection = TetraminoDirection.UP;
    coords: Coordinate = { x: 4, y: 19 };
    type: TetraminoType = TetraminoType.NONE;
    state: ActiveTetraminoState = {
        direction: this.direction,
        coords: this.coords,
        type: this.type
    };

    constructor(props: ActiveTetraminoProps) {
        super(props);
        this.board = props.board;
        // TODO: Make this pull from queue
        this.direction = TetraminoDirection.UP;
        this.type = TetraminoType.NONE;
    }
    componentDidMount() {
        this.getNextPiece();
        const { direction, coords, type } = this;
        this.setState({ direction, coords, type })
    }
    render() {
        if (this.state.type == TetraminoType.NONE) return null;
        const { pieceOffsets, color } = this.getTetraminoInfo();
        const num = this.getDistanceFromLowestPoint();
        const pieceCoords = pieceOffsets.map(offset => this.getPieceCoords(offset))
        return pieceCoords.map(({ x, y }, i) => <Fragment key={i}>
            <Sprite
                texture={getTexture(TetraColor.GHOST)}
                scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
                alpha={pieceCoords.some(coord => coord.x == x && coord.y == y - num) ? 0 : 0.5}
                x={Board.cellSize * x}
                y={Board.cellSize * (this.board.height - (Board.matrixBuffer - Board.matrixVisible + 1) - y + num)}
                roundPixels={true}
            />
            <Sprite
                texture={getTexture(color)}
                scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
                x={Board.cellSize * x}
                y={Board.cellSize * (this.board.height - (Board.matrixBuffer - Board.matrixVisible + 1) - y)}
                roundPixels={true}
            />
        </Fragment>
        )
    }
    getTetraminoInfo = () => tetraminoInfo[this.type];
    // Gets the absolute x/y position on the board for a specific piece
    getPieceCoords(offset: Coordinate): Coordinate {
        const [xOffset, yOffset] = getDirectionOffset(this.direction, offset);
        return {
            x: this.coords.x + xOffset + this.getTetraminoInfo().cursorOffset.x,
            y: this.coords.y + yOffset + this.getTetraminoInfo().cursorOffset.y
        }
    }
    getDistanceFromLowestPoint() {
        return Math.min(...this.getTetraminoInfo().pieceOffsets.map(offset => {
            const { x, y } = this.getPieceCoords(offset);
            for (let i = 0; y - i >= 0; i++) {
                if (this.board.cells[y - i][x].isOccupied) return i - 1;
            }
            return y;
        }))
    }

    // Control methods
    // Move -> returns a boolean based on execution being successful
    moveRight = () => this.move(1)
    moveLeft = () => this.move(-1)
    moveDown = () => this.move(0, -1)
    hardDrop(lock = true) {
        for (let i = 0; i < 100; i++) {
            if (!this.move(0, -1, true)) break;
        }
        this.setState(() => ({ coords: this.coords }));
        if (lock) this.place();
    }
    move(deltaX = 0, deltaY = 0, isCycled = false): boolean {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const { x: initialX, y: initialY } = this.getPieceCoords(offset);
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
    rotate180 = () => this.rotate(2)
    rotate(direction: number) {
        const oldDirection = this.direction
        const newDirection: TetraminoDirection = (this.direction + direction + 4) % 4;
        this.direction = newDirection;
        this.setState({ direction: this.direction })
        if (this.move(0, 0)) return;
        let kickOffsets: Coordinate[];
        if (direction == 2) {
            kickOffsets = flipKickTable[oldDirection];
        } else {
            const kickTable = this.type == TetraminoType.I ? iKickTable[oldDirection] : mainKickTable[oldDirection];
            kickOffsets = direction < 0 ? kickTable.ccw : kickTable.cw;
        }
        for (const kickOffset of kickOffsets) {
            if (this.move(kickOffset.x, kickOffset.y)) return;
        }
        this.direction = oldDirection;
        this.setState({ direction: this.direction })
    }


    // Place -> idk
    place() {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const { x, y } = this.getPieceCoords(offset);
            const cellTarget = this.board.cells[y][x];
            if (!cellTarget) continue;
            cellTarget.isOccupied = true;
            cellTarget.color = this.getTetraminoInfo().color;
            this.board.hold.used = false;
            this.board.setState(({ cells: this.board.cells, hold: this.board.hold }));
        }
        this.board.updateClearedLines();
        this.getNextPiece()
    }

    hold = () => this.getNextPiece(true);
    getNextPiece(getHold = false) {
        if (getHold && this.board.hold.used) return;
        const holdType = this.board.hold.type;
        if (getHold) {
            this.board.hold = { type: this.type, used: true };
            this.board.setState({ hold: this.board.hold })
        }

        if (!getHold || holdType == TetraminoType.NONE) {
            const nextTetramino = this.board.next.shift();
            this.board.updateNext();
            this.type = nextTetramino ?? TetraminoType.NONE;
        } else {
            this.type = holdType;
        }

        this.direction = TetraminoDirection.UP;
        this.coords = { x: 4, y: 19 };
        const { type, direction, coords } = this;
        this.setState({ type, direction, coords });
    }
}