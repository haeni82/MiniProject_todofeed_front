import "./App.css";
import { Routes, Route } from "react-router";

import BugHunter from "@/features/BugHunterGame/BugHunter.jsx";
import RunningGame from "./features/RunningGame";
import RhythmGame from "@/features/RhythmGame";
import Home from "@/features/Home/Home";

function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<BugHunter />} path="/BugHunter" />
      <Route element={<RunningGame />} path="/run" />
      <Route element={<RhythmGame />} path="/rhythm" />
    </Routes>
  );
}

export default App;
