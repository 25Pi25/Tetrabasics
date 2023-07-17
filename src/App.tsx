import { useEffect, useRef } from 'react'
import './App.css'
import { Board } from './components/Board.tsx'


function App() {
  const boardRef = useRef<Board | null>(null);
  useEffect(() => {
    function addThing({ key }: KeyboardEvent) {
      if (key == "p") boardRef.current?.setPaused(!boardRef.current.paused);
    }
    document.addEventListener("keypress", addThing)
    return () => document.removeEventListener("keypress", addThing);
  }, []);
  return <>
    <Board ref={boardRef} />
  </>
}

export default App
