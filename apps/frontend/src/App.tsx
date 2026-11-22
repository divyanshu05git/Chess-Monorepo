
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import { Landing } from './screens/Landing';
import { GamePath } from './screens/GamePath';
import { RequireAuth } from "./components/RequireAuth";
import { Login } from "./screens/Login";

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>}/>
      {/* <Route path="/game" element={<GamePath/>}/> */}
      <Route path="/login" element={<Login />} />
      <Route path="/game" element={<RequireAuth><GamePath /></RequireAuth>} />
      <Route path="/game/:gameId" element={<RequireAuth><GamePath /></RequireAuth>} />
      {/* <Route path="/game/:gameId" element={<GamePath />} /> */}
    </Routes>
  </BrowserRouter>
    </>
  )
}

export default App
