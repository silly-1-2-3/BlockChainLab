import React from 'react';
import logo from './logo.svg';
import './App.css';
import LoginPage from './component/login';
import MainPage from './component/main'
import {BrowserRouter, Route, Routes} from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LoginPage/>}/>
                <Route path={"/main"} element={<MainPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
