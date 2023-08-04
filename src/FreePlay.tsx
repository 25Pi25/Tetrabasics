import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ConfigBar from './components/ConfigBar.tsx';
import { Board } from './components/Board/Board.tsx';
import Config from './config.tsx';
import { Script } from './components/ScriptEditor/scriptTypes.tsx';

export default function FreePlay() {
    const [board, setBoard] = useState<boolean>(false);
    const [script, setScript] = useState<Script>({ functions: [], variables: [] });
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        function thing(e: KeyboardEvent) {
            if (e.key != Config.config?.controls.reset) return;
            setBoard(board => !board);
        }
        document.addEventListener("keydown", thing);
        return () => document.removeEventListener("keydown", thing);
    }, [])

    return <div style={{ display: "flex", gap: "2em" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Board key={board ? 0 : 1} startNow={true} script={script} />
            <button onClick={() => fileInputRef.current?.click()}>Import Script</button>
            <input
                type="file"
                accept=".json,.ttb"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => void importScript(e, setScript)}
            />
        </div>
        <ConfigBar />
    </div>
}

async function importScript(e: ChangeEvent<HTMLInputElement>, setScript: Dispatch<SetStateAction<Script>>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const data: string = await new Promise((res, rej) => {
            const read = new FileReader();
            read.onload = (e) => res(e.target?.result as string);
            read.onerror = (err) => rej(err);
            read.readAsText(file);
        })
        const parsedData = JSON.parse(data) as Script;
        setScript(parsedData);
        // TODO: Add type checking for scripts
    } catch {
        console.error("Failed to import script.");
    }
}