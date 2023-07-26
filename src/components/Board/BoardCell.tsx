import { Coordinate, TetraColor } from '../../types';
import { Board } from './Board';
import { Sprite } from '@pixi/react';
import { getTexture } from '../../util';
import { Point } from 'pixi.js';


interface BoardCellProps {
    board: Board;
    coords: Coordinate;
    isOccupied: boolean;
    color: TetraColor;
}
export default function BoardCell({ board, coords, isOccupied, color }: BoardCellProps) {
    return <Sprite
        texture={getTexture(color, coords.y, board.height)}
        scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
        alpha={isOccupied ? 1 : 0.5}
        x={coords.x * Board.cellSize}
        y={Board.cellSize * (board.height - (Board.matrixBuffer - Board.matrixVisible + 1) - coords.y)}
        key={`cell ${coords.x} ${coords.y}`}
    />
}