import { useRef } from 'react'
import './App.css'
import { Board } from './components/Board/Board.tsx'
import jsons from './script.json' assert {type: "json"};
import { Script } from './components/ScriptEditor/scriptTypes.tsx';

function App() {
  const boardRef = useRef<Board | null>(null);
  return <>
    <Board ref={boardRef} script={jsons as Script}/>
  </>
}

export default App
