import React from 'react';
import { Route, Routes} from 'react-router-dom';
import { useState, useEffect} from "react";
import { useContractKit } from "@celo-tools/use-contractkit";

 
import Navbar from './components/NavBar';
import Home from './components/Home';
import YourNFTs from './components/YourNFTs';
import NftMarketPlace from "./components/NftMarketPlace";
import Products from './components/Products';
import abi from "./contracts/abi.json";

 
function App(){
  const { getConnectedKit} = useContractKit();
  let giftContractAddress = "0x7DC1053980863d941CCB4C5Abb60E4460Cc88f91"; 
  const [giftContract, setGiftContract] = useState();


  const getLoans = async() => {
    const kit = await getConnectedKit();
    console.log("get loans called");
    let _giftContract = new kit.web3.eth.Contract(abi.abi, giftContractAddress);
    setGiftContract(_giftContract);
  }

  useEffect(() => {
    getLoans();
  },[] );
  return(
    <>
      <Navbar />
      <Routes>
        <Route path = "/" element={<Home giftContract = {giftContract} />} />
        <Route path = "/yournfts" element={< YourNFTs giftContract = {giftContract} />} />
        <Route path = "/Products" element={< Products giftContract = {giftContract} />} />
        <Route path = "/nftmarketplace" element={< NftMarketPlace giftContract = {giftContract} />} />
      </ Routes>
    </>

  )
}

 
export default App;