import { Container, Graphics, Text } from '@pixi/react';
import { Board } from './Board';
import { TextStyle } from 'pixi.js';

export default function UnfocusedDialog({ board, renderedHeight }: { board: Board, renderedHeight: number }) {
    const x = board.width * Board.cellSize;
    const y = renderedHeight * Board.cellSize;

    const heightPercent = 0.25
    return <Container y={y / 2 - y * heightPercent / 2}>
        <Graphics
            draw={g => {
                g.clear();
                g.beginFill(0x000000, 0.8);
                g.drawRect(0, 0, x, y * heightPercent);
                g.endFill();
            }}
        />
        <Text text={"OUT OF FOCUS"} anchor={0.5} style={getTextStyle(x, true)} x={x / 2} y={y * heightPercent * 0.25} />
        <Text text={"Click to return"} anchor={0.5} style={getTextStyle(x)} x={x / 2} y={y * heightPercent * 0.75} />
    </Container>
}

function getTextStyle(x: number, isHeader = false) {
    return new TextStyle({
        fontFamily: 'ProFontWindows',
        fontSize: x / (isHeader ? 8 : 12),
        fill: 'white',
        wordWrap: true,
        wordWrapWidth: x * 0.9,
        padding: 10
    })
}