import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomJoin } from './components/RoomJoin';
import { Room } from './components/Room';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomJoin />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;