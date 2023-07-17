import { useEffect, useRef } from 'react'
import './App.css'
import { Board } from './components/Board.tsx'
import TetraminoDisplay from './components/Tetramino.tsx'
import { TetraminoType } from './types.tsx'


function App() {
  const boardRef = useRef<Board | null>(null);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key == "a") boardRef.current?.activeTetramino.current?.moveLeft()
      if (e.key == "d") boardRef.current?.activeTetramino.current?.moveRight()
      if (e.key == "s") boardRef.current?.activeTetramino.current?.moveDown()
      if (e.key == "w") boardRef.current?.activeTetramino.current?.hardDrop()
      if (e.key == "3") boardRef.current?.activeTetramino.current?.rotateRight()
      if (e.key == "2") boardRef.current?.activeTetramino.current?.rotateLeft()
    }
    addEventListener("keydown", handleKey);
    return () => removeEventListener("keydown", handleKey)
  }, [])
  return <>
    <Board ref={boardRef} />
    <TetraminoDisplay type={TetraminoType.T} />
    <TetraminoDisplay type={TetraminoType.I} />
    <TetraminoDisplay type={TetraminoType.O} />
    <TetraminoDisplay type={TetraminoType.S} />
    <TetraminoDisplay type={TetraminoType.Z} />
    <TetraminoDisplay type={TetraminoType.J} />
    <TetraminoDisplay type={TetraminoType.L} />
  </>
}

export default App
