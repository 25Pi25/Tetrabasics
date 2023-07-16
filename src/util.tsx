import { BaseTexture, Rectangle, SCALE_MODES, Texture } from 'pixi.js';
import { TetraColor, TetraminoDirection } from './types';
import grid from "./assets/gloss.png";
import empty from "./assets/empty.png";

export function getTexture(color: TetraColor) {
    const texture = color == TetraColor.NONE ?
        new Texture(BaseTexture.from(empty)) :
        new Texture(BaseTexture.from(grid), new Rectangle(31 * color, 0, 30, 30))
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
}

export function getPieceOffset(direction: TetraminoDirection, xOffset: number, yOffset: number): [number, number] {
    const directionToPieceOffset: Record<TetraminoDirection, [number, number]> = {
        [TetraminoDirection.UP]: [xOffset, yOffset],
        [TetraminoDirection.RIGHT]: [yOffset * -1, xOffset],
        [TetraminoDirection.DOWN]: [xOffset * -1, yOffset * -1],
        [TetraminoDirection.LEFT]: [yOffset, xOffset]
    };
    return directionToPieceOffset[direction];
}