import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App.tsx'
import FreePlay from './FreePlay.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<App />} />
          <Route path="freeplay" element={<FreePlay />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
