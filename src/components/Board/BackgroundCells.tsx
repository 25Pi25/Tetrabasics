import { TilingSprite } from '@pixi/react';
import empty from "../../assets/empty.png";
import topBorder from "../../assets/top-border.png"
import { Texture } from 'pixi.js';
import { Board } from './Board';

export function BackgroundCells({ board }: { board: Board }) {
    const emptyTexture = Texture.from(empty);
    const topBorderTexture = Texture.from(topBorder);
    return <>
        <TilingSprite
            texture={topBorderTexture}
            width={Board.cellSize * board.width}
            height={1}
            y={Board.cellSize * (Board.matrixVisible - 1/30)}
            alpha={0.5}
            tilePosition={{ x: 0, y: 0 }}
            tileScale={{ x: 1, y: 1 }}
        />
        <TilingSprite
            texture={emptyTexture}
            width={Board.cellSize * board.width}
            height={Board.cellSize * (board.height - Board.matrixBuffer)}
            y={Board.cellSize * Board.matrixVisible}
            alpha={0.5}
            tilePosition={{ x: 0, y: 0 }}
            tileScale={{ x: 1, y: 1 }}
        />
    </>
}