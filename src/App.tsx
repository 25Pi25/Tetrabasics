import { useEffect, useRef } from 'react'
import './App.css'
import { Board } from './components/Board/Board.tsx'
import jsons from './script.json' assert {type: "json"};
import { Script } from './components/ScriptEditor/scriptTypes.tsx';

function App() {
  const boardRef = useRef<Board | null>(null);
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
  return <>
    {<Board ref={boardRef} script={jsons as Script} />}
  </>
}

export default App
