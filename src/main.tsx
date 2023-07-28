import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from './Menu.tsx'
import FreePlay from './FreePlay.tsx'
import Config from './config.tsx'
import Editor from './Editor.tsx';

Config.createConfig();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Menu />} />
          <Route path="freeplay" element={<FreePlay />} />
          <Route path="editor" element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
