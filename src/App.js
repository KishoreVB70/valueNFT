//React
import React from 'react';
import { Route, Routes} from 'react-router-dom';

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
import "./styles/App.css";

const App = function AppWrapper() {


  //Celo
  const { address, destroy, connect } = useContractKit();
  const { balance } = useBalance();

  let giftContractAddress = "0xE91940de2Fe868521F24BFd35628B18379B7F663";

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
                <Route path = "/" element={<Home giftContractAddress = {giftContractAddress} />} />
                <Route path = "/yournfts" element={< YourNFTs giftContractAddress = {giftContractAddress} />} />
                <Route path = "/Products" element={< Products  giftContractAddress = {giftContractAddress} />} />
                <Route path = "/nftmarketplace" element={< NftMarketPlace giftContractAddress = {giftContractAddress}  />} />
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
 