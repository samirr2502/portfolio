import React  from 'react'
import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react';

import './App.css'

import Header from './snippets/header'
import Footer from './snippets/footer'
import Home from './pages/home'
import Personal from './pages/personalProjects'
import School from './pages/schoolProjects'
import Admin from './admin/pages/admin'
import Login from './admin/pages/login'

function App() {
  const [authenticated,setAuthenticated] = useState(false);
  return (
    <div className='body'>
      <Header className="header"/>
        <main className="main">
        <Routes>
            <Route path={"/"} element={<Home />} />
            <Route path={"/personal"} element={<Personal />} />
            <Route path={"/school"} element={<School />} />
            <Route path={"/admin"} element={ authenticated && <Admin setAuthenticated={setAuthenticated}/>
            || <Login authenticated = {authenticated} setAuthenticated={setAuthenticated}/>
          }/>
            <Route path={"*"} element={<div>Not Found</div>}/>
        </Routes>
      </main>
        <Footer className="footer"/>
    </div>
  )
}

export default App
