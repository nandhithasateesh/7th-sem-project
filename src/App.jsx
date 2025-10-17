import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import NormalMode from './pages/NormalMode'
import SecureMode from './pages/SecureMode'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/normal" element={<NormalMode />} />
        <Route path="/secure" element={<SecureMode />} />
      </Routes>
    </Router>
  )
}

export default App


// make sure this is the only part of code
// i want you to chnage
// this shouldnt affect the existing other part of the code

//IN NORMAL MODE