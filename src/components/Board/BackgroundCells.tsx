import { TilingSprite } from '@pixi/react';
import empty from "../../assets/empty.png";
import topBorder from "../../assets/top-border.png"
import { Point, Texture } from 'pixi.js';
import { Board } from './Board';

export function BackgroundCells({ board }: { board: Board }) {
    return <>
        <TilingSprite
            texture={Texture.from(topBorder)}
            width={Board.cellSize * board.width}
            height={1}
            y={Board.cellSize * (Board.matrixVisible - 1/30)}
            alpha={0.5}
            tilePosition={{ x: 0, y: 0 }}
            tileScale={{ x: 1, y: 1 }}
        />
        <TilingSprite
            texture={Texture.from(empty)}
            width={30 * board.width}
            height={30 * (board.height - Board.matrixBuffer)}
            y={Board.cellSize * Board.matrixVisible}
            scale={new Point(Board.cellSize / 30, Board.cellSize / 30)}
            alpha={0.5}
            tilePosition={{ x: 0, y: 0 }}
            tileScale={{ x: 1, y: 1 }}
        />
    </>
}