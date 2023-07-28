import { useEffect, useState } from 'react';
import ConfigBar from './ConfigBar.tsx';
import { Board } from './components/Board/Board.tsx';
import Config from './Config.tsx';

export default function FreePlay() {
    const [board, setBoard] = useState<boolean>(false);

    useEffect(() => {
        function thing(e: KeyboardEvent) {
            if (e.key != Config.config?.controls.reset) return;
            setBoard(board => !board);
        }
        document.addEventListener("keydown", thing);
        return () => document.removeEventListener("keydown", thing);
    }, [])

    return <div style={{ display: "flex", gap: "2em" }}>
        <Board key={board ? 0 : 1} startNow={true} />
        <ConfigBar />
    </div>
}