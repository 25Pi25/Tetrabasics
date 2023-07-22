import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Board } from './components/Board/Board.tsx'
import jsons from './script.json' assert {type: "json"};
import { Command, Script } from './components/ScriptEditor/scriptTypes.tsx';
import DynamicContentComponent from './components/ScriptEditor/ScriptEditor.tsx';

export default function App() {
  const boardRef = useRef<Board | null>(null);
  const [script, setScript] = useState<Command[][]>((jsons as Script).functions);
  useEffect(() => {
    function things(e: KeyboardEvent) {
      if (e.key == "r") {
        void boardRef.current?.gameOver();
        void boardRef.current?.startGame();
      }
    }
    document.addEventListener("keypress", things)
    return () => document.removeEventListener("keypress", things)
  }, [])
  //{ functions: script, variables } ?? jsons as Script} />
  return <>
    <Board ref={boardRef} script={jsons as Script} /> 
    <DynamicContentComponent script={script} setScript={setScript} />
  </>
}