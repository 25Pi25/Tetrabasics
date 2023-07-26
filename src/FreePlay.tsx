import './App.css';
import Config from './Config.tsx';
import { Board } from './components/Board/Board.tsx';

export default function FreePlay() {
    return <div style={{ display: "flex", gap: "2em" }}>
        <Board />
        <Config />
    </div>
}