import { Sprite, Stage } from '@pixi/react';
import { TetraColor, TetraminoType, tetraminoInfo } from '../types';
import { getTexture } from '../util';
import { Point } from 'pixi.js';

interface TetraminoDisplayProps {
    type?: TetraminoType;
    width?: number;
    height?: number;
    scale?: number;
    overrideColor?: TetraColor;
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