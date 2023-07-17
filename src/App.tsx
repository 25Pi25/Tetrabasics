import { useRef } from 'react'
import './App.css'
import { Board } from './components/Board.tsx'


function App() {
  const boardRef = useRef<Board | null>(null);
  return <>
    <Board ref={boardRef} />
  </>
}

export default App
