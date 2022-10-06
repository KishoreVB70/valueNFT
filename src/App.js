//React
import React from 'react';
import { Route, Routes} from 'react-router-dom';
import { useState, useEffect} from "react";

//Celo
import { useContractKit } from "@celo-tools/use-contractkit";
import { Nav } from "react-bootstrap";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/Wallet";
import Cover from "./components/Cover";
import { useBalance} from "./hooks";

 // Components
import Navbar from './components/NavBar';
import Home from './pages/Home';
import YourNFTs from './pages/YourNFTs';
import NftMarketPlace from "./pages/NftMarketPlace";
import Products from './pages/Products';

//My Imports
import abi from "./contracts/abi.json";
import "./styles/App.css";

const App = function AppWrapper() {


  //Celo
  const { address, destroy, connect } = useContractKit();
  const { balance } = useBalance();
  const { getConnectedKit} = useContractKit();

  //Contract
  let giftContractAddress = "0x7DC1053980863d941CCB4C5Abb60E4460Cc88f91"; 
  const [giftContract, setGiftContract] = useState();


  const getContract = async() => {
    const kit = await getConnectedKit();
    console.log("get contract called");
    let _giftContract = new kit.web3.eth.Contract(abi.abi, giftContractAddress);
    setGiftContract(_giftContract);
  }

  useEffect(() => {
    getContract();
  },[] );


  return (
    <>
      <Notification />
      {address ? (
        <div >
          <Nav className='address'>
            <Nav.Item>
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main>
            <div>
              <Navbar />
              <Routes>
                <Route path = "/" element={<Home giftContract = {giftContract} />} />
                <Route path = "/yournfts" element={< YourNFTs giftContract = {giftContract} />} />
                <Route path = "/Products" element={< Products giftContract = {giftContract} />} />
                <Route path = "/nftmarketplace" element={< NftMarketPlace giftContract = {giftContract} />} />
              </ Routes>
            </div>
          </main>
        </div>
      ) : (
        // display cover if user is not connected
        <div className="App">
          <header className="App-header">
            <Cover connect={connect} />
          </header>
        </div>
      )}
    </>
  );
};

export default App;
 