import { Rectangle, Texture, Point, BaseTexture } from 'pixi.js';
import { Stage, Sprite } from '@pixi/react'; 7
import grid from "./assets/gloss.png";
import empty from "./assets/empty.png";
import './Board.css';

export default function Board({ width, height }: { width: number, height: number }) {
    width = Math.min(Math.max(4, width), 20);
    height = Math.min(Math.max(4, height), 40);
    const pixel = 25;
    const sprites = Array.from({ length: width * height }, (_, i) => {
        const texture = Math.random() < 0.5 ?
            new Texture(BaseTexture.from(grid), new Rectangle(31 * Math.floor(Math.random() * 12), 0, 30, 30)) :
            new Texture(BaseTexture.from(empty));
        return <Sprite
            texture={texture}
            scale={new Point(pixel / 30, pixel / 30)}
            x={i % width * pixel}
            y={Math.floor(i / width) * pixel}
            key={`cell${i}`}
            roundPixels={true}
        />
    })

    return <Stage className='board' width={width * pixel} height={height * pixel}>
        {sprites}
    </Stage>
}