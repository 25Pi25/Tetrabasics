import { Tetramino } from './components/Tetramino'

export enum TetraColor {
    NONE = -1,
    RED = 0,
    ORANGE = 1,
    YELLOW = 2,
    GREEN = 3,
    CYAN = 4,
    BLUE = 5,
    PURPLE = 6,
    GHOST = 7,
    GARBAGE = 8,
    UNCLEARABLE = 11
}

export enum TetraminoType {
    L = "L",
    J = "J",
    Z = "Z",
    S = "S",
    T = "T",
    I = "I",
    O = "O",
    NONE = "NONE"
}

export interface Coordinate {
    x: number
    y: number
}

export enum TetraminoDirection {
    UP,
    RIGHT,
    DOWN,
    LEFT
}

export interface WallKicks {
    cw: Coordinate[]
    ccw: Coordinate[]
}

export const mainKickTable: Record<TetraminoDirection, WallKicks> = {
    [TetraminoDirection.UP]: {
        cw: [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
        ccw: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }]
    },
    [TetraminoDirection.RIGHT]: {
        cw: [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
        ccw: [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -2 }, { x: 1, y: 2 }]
    },
    [TetraminoDirection.DOWN]: {
        cw: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
        ccw: [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }]
    },
    [TetraminoDirection.LEFT]: {
        cw: [{ x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
        ccw: [{ x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }]
    },
}

export const IKickTable: Record<TetraminoDirection, WallKicks> = {
    [TetraminoDirection.UP]: {
        cw: [{ x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
        ccw: [{ x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: -1 }]
    },
    [TetraminoDirection.RIGHT]: {
        cw: [{ x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, { x: 2, y: -1 }],
        ccw: [{ x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }]
    },
    [TetraminoDirection.DOWN]: {
        cw: [{ x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }],
        ccw: [{ x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }]
    },
    [TetraminoDirection.LEFT]: {
        cw: [{ x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }],
        ccw: [{ x: -2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }]
    },
}

export const tetraminoInfo: Record<TetraminoType, Tetramino> = {
    [TetraminoType.L]: {
        color: TetraColor.ORANGE,
        cursorOffset: { x: 0, y: 0 },
        pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
    },
    [TetraminoType.J]: {
        color: TetraColor.BLUE,
        cursorOffset: { x: 0, y: 0 },
        pieceOffsets: [{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
    },
    [TetraminoType.Z]: {
        color: TetraColor.RED,
        cursorOffset: { x: 0, y: 0 },
        pieceOffsets: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
    },
    [TetraminoType.S]: {
        color: TetraColor.GREEN,
        cursorOffset: { x: 0, y: 0 },
        pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    },
    [TetraminoType.T]: {
        color: TetraColor.PURPLE,
        cursorOffset: { x: 0, y: 0 },
        pieceOffsets: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }]
    },
    [TetraminoType.O]: {
        color: TetraColor.YELLOW,
        cursorOffset: { x: 0.5, y: 0.5 },
        pieceOffsets: [{ x: -0.5, y: 0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }]
    },
    [TetraminoType.I]: {
        color: TetraColor.CYAN,
        cursorOffset: { x: 0.5, y: -0.5 },
        pieceOffsets: [{ x: -1.5, y: 0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 }]
    },
    [TetraminoType.NONE]: {
        color: TetraColor.NONE,
        cursorOffset: { x: 0, y: 0 },
        pieceOffsets: []
    },
}