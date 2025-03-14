import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Header from "./components/Header/index";
import Home from "./pages/Home/index";
import CreateNFT from "./pages/CreateNFT/index";
import Item from "./pages/Item/index";

import "./App.css";


function App() {
  return (
    <div style={{backgroundColor: "#f5f5f5"}} className="flex flex-col items-center justify-center min-h-screen">
      <Router>
        <Header />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/create-nft" component={CreateNFT} />
          <Route path="/nft/:nftId" component={Item} />
          <Route>404 Not Found!</Route>
        </Switch>
      </Router> 
    </div>
  );
}

export default App;
