import { BaseTexture, Rectangle, SCALE_MODES, Texture } from 'pixi.js';
import { Coordinate, TetraColor, TetraminoDirection } from './types';
import grid from "./assets/gloss.png";
import empty from "./assets/empty.png";
import { Board } from './components/Board';

export function getTexture(color: TetraColor, y = 0) {
    const texture = color == TetraColor.NONE ?
        y > Board.matrixBuffer - 1 ? Texture.EMPTY : new Texture(BaseTexture.from(empty)) :
        new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, 30, 30))
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
}

export function getDirectionOffset(direction: TetraminoDirection, { x, y }: Coordinate): [number, number] {
    const directionToPieceOffset: Record<TetraminoDirection, [number, number]> = {
        [TetraminoDirection.UP]: [x, y],
        [TetraminoDirection.RIGHT]: [y, x * -1],
        [TetraminoDirection.DOWN]: [x * -1, y * -1],
        [TetraminoDirection.LEFT]: [y * -1, x]
    };
    return directionToPieceOffset[direction];
}