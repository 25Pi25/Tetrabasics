import { useEffect, useState } from 'react';
import { Coordinate, TetraColor } from '../types';
import { Board } from './Board';
import { Sprite } from '@pixi/react';
import { getTexture } from '../util';
import { Point } from 'pixi.js';


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
export default function BoardCell({ board, coords, isOccupied, color }: BoardCellProps) {
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