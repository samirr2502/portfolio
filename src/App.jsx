import React  from 'react'
import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react';


import Header from './snippets/header'
import Footer from './snippets/footer'
import Home from './pages/home'
import Personal from './pages/personalProjects'
import School from './pages/schoolProjects'
import Admin from './admin/pages/admin'
import Login from './admin/pages/login'
import About from './pages/about';

function App() {
  const [authenticated,setAuthenticated] = useState(false);
  return (
    <div className="body bg-[var(--bg-dark)] text-[var(--text-light)] min-h-screen flex flex-col">
      
      {/* Header */}
        <Header />
      

      {/* Main Content */}
      <main className="main flex-1 overflow-y-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/school" element={<School />} />
          <Route path="/about" element={<About />} />
          <Route path="/*" element={<Home />} />

          <Route
            path="/admin"
            element={
              authenticated ? (
                <Admin setAuthenticated={setAuthenticated} />
              ) : (
                <Login authenticated={authenticated} setAuthenticated={setAuthenticated} />
              )
            }
          />
          <Route path="*" element={<div className="text-center mt-8">Not Found</div>} />
        </Routes>
      </main>

      {/* Footer */}
        <Footer />

    </div>
  )
}

export default App
