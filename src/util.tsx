import { BaseTexture, Rectangle, SCALE_MODES, Texture } from 'pixi.js';
import { Coordinate, TetraColor, TetraminoDirection } from './types';
import grid from "./assets/TetrisPlusClassic.png";
import empty from "./assets/empty.png";
import { Board } from './components/Board/Board';

export function getTexture(color: TetraColor, y = 0, boardHeight = 20) {
    const texture = color == TetraColor.NONE ?
        y >= boardHeight - Board.matrixBuffer ? Texture.EMPTY : new Texture(BaseTexture.from(empty)) :
        new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, 30, 30))
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
}

export function getDirectionOffset(direction: TetraminoDirection, { x, y }: Coordinate): Coordinate {
    const directionToPieceOffset: Record<TetraminoDirection, Coordinate> = {
        [TetraminoDirection.UP]: { x, y },
        [TetraminoDirection.RIGHT]: { x: y, y: x * -1 },
        [TetraminoDirection.DOWN]: { x: x * -1, y: y * -1 },
        [TetraminoDirection.LEFT]: { x: y * -1, y: x }
    };
    return directionToPieceOffset[direction];
}