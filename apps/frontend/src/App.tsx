import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import { Landing } from './screens/landing';
import { GamePath } from './screens/GamePath';

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/game" element={<GamePath/>}/>
    </Routes>
  </BrowserRouter>
    </>
  )
}

export default App
