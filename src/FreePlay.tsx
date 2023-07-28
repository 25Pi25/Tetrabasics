import { useEffect, useState } from 'react';
import './App.css';
import Config from './Config.tsx';
import { Board } from './components/Board/Board.tsx';

export default function FreePlay() {
    const [board, setBoard] = useState<boolean>(false);

    useEffect(() => {
        function thing(e: KeyboardEvent) {
            if (e.key != "r") return;
            setBoard(board => !board);
            console.log("done")
        }
        document.addEventListener("keydown", thing);
        return () => document.removeEventListener("keydown", thing);
    }, [])

    return <div style={{ display: "flex", gap: "2em" }}>
        <Board key={board ? 0 : 1} startNow={true} />
        <Config />
    </div>
}