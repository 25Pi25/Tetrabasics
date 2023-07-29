import { useEffect, useState } from 'react';
import { Board } from './components/Board/Board.tsx';
import { Command } from './components/ScriptEditor/scriptTypes.tsx';
import DynamicContentComponent from './components/ScriptEditor/ScriptEditor.tsx';
import Config from './Config.tsx';

export default function FreePlay() {
    const [board, setBoard] = useState<boolean>(false);
    const [script, setScript] = useState<Command[][]>([[{ type: "", args: [] }]]);

    useEffect(() => {
        function thing(e: KeyboardEvent) {
            if (e.key != Config.config?.controls.reset) return;
            setBoard(board => !board);
        }
        document.addEventListener("keydown", thing);
        return () => document.removeEventListener("keydown", thing);
    }, [])

    return <div style={{ display: "flex", gap: "2em" }}>
        <Board key={board ? 0 : 1} startNow={true} script={{ functions: script, variables: [] }} />
        <DynamicContentComponent script={script} setScript={setScript} />
    </div>
}