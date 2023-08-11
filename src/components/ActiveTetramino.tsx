import { Sprite } from '@pixi/react';
import { Coordinate, TSpinType, TetraColor, TetraminoDirection, TetraminoType, flipKickTable, iKickTable, mainKickTable, tetraminoInfo } from '../types'
import { Point } from 'pixi.js';
import { getDirectionOffset, getTexture } from '../util';
import { Component, Fragment } from 'react';
import { Board } from './Board/Board';
import { PauseType } from './Board/controls';

interface ActiveTetraminoProps {
    board: Board;
}
interface ActiveTetraminoState {
    direction: TetraminoDirection
    coords: Coordinate;
    type: TetraminoType;
}
export default class ActiveTetramino extends Component<ActiveTetraminoProps, ActiveTetraminoState> {
    board: Board;
    direction: TetraminoDirection = TetraminoDirection.UP;
    coords: Coordinate = { x: 0, y: 0 };
    type: TetraminoType = TetraminoType.NONE;
    tSpinType = TSpinType.NONE;
    // -1 indicates you have infinite rotations until locking
    rotations = -1;
    lockTimeout: ReturnType<typeof setTimeout> | null = null;
    state: ActiveTetraminoState = {
        direction: this.direction,
        coords: this.coords,
        type: this.type
    };

    constructor(props: ActiveTetraminoProps) {
        super(props);
        this.board = props.board;
        this.direction = TetraminoDirection.UP;
        this.type = TetraminoType.NONE;
    }
    componentDidMount() {
        if (this.board.startGameNextRender) setTimeout(() => void this.board.startGame(), 0)
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
        const { x: xOffset, y: yOffset } = getDirectionOffset(this.direction, offset);
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
            if (!this.move(0, -1, { isCycled: true })) break;
        }
        this.setState(({ coords: this.coords }));
        if (lock) this.place();
    }
    move(deltaX = 0, deltaY = 0, { isCycled = false, isRotation = false } = {}): boolean {
        const LOCK_TIMEOUT = 500;
        if (!this.canMove(deltaX, deltaY)) return false;
        this.coords = { x: this.coords.x + deltaX, y: this.coords.y + deltaY }
        if (!isCycled) this.setState(({ coords: this.coords }));
        if (!isRotation) this.tSpinType = TSpinType.NONE;

        if (this.rotations > 0) this.rotations--;
        if (this.lockTimeout) clearInterval(this.lockTimeout);
        if (!this.canMove(0, -1)) {
            // TODO: Custom lock delay maybe?
            if (this.rotations == -1) this.rotations = 15;
            if (this.rotations == 0) this.place();
            else this.lockTimeout = setTimeout(() => this.place(), LOCK_TIMEOUT);
        }
        return true;
    }
    canMove(deltaX = 0, deltaY = 0): boolean {
        for (const offset of this.getTetraminoInfo().pieceOffsets) {
            const { x: initialX, y: initialY } = this.getPieceCoords(offset);
            const [x, y] = [initialX + deltaX, initialY + deltaY]
            if (x < 0 || y < 0) return false;
            if (x >= this.board.width || y >= this.board.height) return false;
            const destination = this.board.cells[y]?.[x]
            if (destination.isOccupied) return false;
        }
        return true;
    }

    // First two pieces occupied are the blocks facing T. If it's not T obv there's no T-Spin
    // If the amount of filled corners is less than 3 it is not a T-Spin
    // If the front corners facing the T are filled OR the last rotation was kick 3/4 then it's a T-Spin, else mini
    checkTSpin(kickIndex: number): TSpinType {
        if (this.type != TetraminoType.T) return TSpinType.NONE;
        const piecesOccupied = [{ x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }]
            .map(x => getDirectionOffset(this.direction, x))
            .map(({ x, y }) => this.board.cells[this.coords.y + y]?.[this.coords.x + x]?.isOccupied ?? true);
        return piecesOccupied.reduce((a, b) => a + (b ? 1 : 0), 0) < 3 ? TSpinType.NONE :
            piecesOccupied[0] && piecesOccupied[1] || kickIndex >= 3 ? TSpinType.TSPIN : TSpinType.MINI
    }

    // Rotate -> idk
    rotateRight = () => this.rotate(1)
    rotateLeft = () => this.rotate(-1)
    rotate180 = () => this.rotate(2)
    rotate(direction: number) {
        const oldDirection = this.direction
        const newDirection: TetraminoDirection = (this.direction + direction + 4) % 4;
        this.direction = newDirection;
        this.setState(({ direction: this.direction }))
        if (this.move(0, 0, { isRotation: true })) {
            this.tSpinType = this.checkTSpin(0);
            return;
        }
        let kickOffsets: Coordinate[];
        if (direction == 2) {
            kickOffsets = flipKickTable[oldDirection];
        } else {
            const kickTable = this.type == TetraminoType.I ? iKickTable[oldDirection] : mainKickTable[oldDirection];
            kickOffsets = direction < 0 ? kickTable.ccw : kickTable.cw;
        }
        for (let i = 0; i < kickOffsets.length; i++) {
            const kickOffset = kickOffsets[i];
            if (this.move(kickOffset.x, kickOffset.y, { isRotation: true })) {
                this.tSpinType = this.checkTSpin(i + 1);
                return;
            }
        }
        this.direction = oldDirection;
        this.setState(({ direction: this.direction }));
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
        }
        this.board.setState(({ cells: this.board.cells, hold: this.board.hold }), () => this.getNextPiece());
        this.board.meta.pieces++;
        this.board.updateClearedLines(this.tSpinType);
    }

    hold = () => this.getNextPiece(true);
    getNextPiece(getHold = false) {
        if (this.board.paused) return;
        if (getHold && this.board.hold.used) return;
        if (!this.board.next.length && this.board.hold.type == TetraminoType.NONE) {
            this.board.setPaused(PauseType.ON);
            this.type = TetraminoType.NONE;
            this.board.redraw();
            return;
        }

        const holdType = this.board.hold.type;
        if (getHold) {
            // establish 1st hold and go to the next one
            if (holdType == TetraminoType.NONE) {
                const nextTetramino = this.board.next.shift();
                this.board.hold = { type: this.type, used: true };
                this.board.updateNext();
                this.type = nextTetramino ?? TetraminoType.NONE;
            } else {
                this.board.hold = { type: this.type, used: true };
                this.type = holdType;
            }
            this.board.setState(({ hold: this.board.hold }))
        } else {
            if (this.board.next.length) {
                const nextTetramino = this.board.next.shift();
                this.board.updateNext();
                this.type = nextTetramino ?? TetraminoType.NONE;
            } else {
                this.board.hold = { type: TetraminoType.NONE, used: true };
                this.type = holdType;
                this.board.setState(({ hold: this.board.hold }))
            }
        }

        // TODO: Add game over if none exists
        this.direction = TetraminoDirection.UP;
        this.coords = { x: Math.floor(this.board.width / 2) - 1, y: this.board.height - Board.matrixBuffer + 1 };
        this.rotations = -1;
        // TODO: Make this check if there's available space, else game over
        if (!this.move(0, 0)) void this.board.gameOver();
        const { type, direction, coords } = this;
        this.setState(({ type, direction, coords }));
        this.board.redraw();
    }
}