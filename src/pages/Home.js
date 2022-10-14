import React from "react";
import Mint from "../components/Mint";
import { useState } from "react";
import { useNavigate } from "react-router-dom";



import "../styles/Home.css";

const Home = (props) => {
  const [showModal, setShowModal] = useState();
  let giftContractAddress = props.giftContractAddress; 
  let giftContract = props.giftContract;
  const navigate = useNavigate();


  return (
    <div className="homeContainer">
        <button className="askForLoan bigBtn" onClick={() => setShowModal(true)}>Mint An NFT</button>
        <Mint onClose={() => setShowModal(false)} giftContractAddress = {giftContractAddress} show={showModal} giftContract = {giftContract}  />
          <h1>NFT Value Card Based Economy!</h1>
        <div className="rowDiv">
          <div className="normalDivs">
            <h3>Your NFTs</h3>
            <button className="newBtn" onClick={() => navigate("/YourNFTs")} >Go to your NFTS</button>
            <p>→ Mint NFTs for cash</p>
            <p>→ Redeem them anytime for the original cash</p>
            <p>→ Both involves a fee of 0.1 celo </p>
            <p>→ Gift NFTs to any user</p>  
          </div>
          <div className="normalDivs">
          <h3>Marketplace Section</h3>
            <button className="newBtn" onClick={() => navigate("/nftMarketplace")}>Go to the Marketplace</button>
            <p>→ List your NFTs for sale</p>
            <p>→ Buy NFTS without the risk of minting fee</p>
            <p>→ Get cash for your NFTS without the risk of Redeem Fee</p>
          </div>
        </div>
          <div className="normalDivs">
            <h3>Product Section</h3>
            <button className="newBtn" onClick={() => navigate("/Products")} >Go to products</button>
            <p>→ Buy Products for less price if you buy with Value NFT!</p>
            <p>→ List products and earn rewards from sales(0.1 celo per 3 sales)</p>
          </div>

        {/* <Details  loans= {loans} loanContract={loanContract}  getLoans = {getLoans} /> */}
    </div>
  );
};

export default Home;
