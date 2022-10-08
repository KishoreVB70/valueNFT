import React from "react";
import Mint from "../components/Mint";
import { useState } from "react";


import "../styles/App.css";

const Home = (props) => {
  const [showModal, setShowModal] = useState();
  let giftContractAddress = props.giftContractAddress; 
  let giftContract = props.giftContract;

  return (
    <div>
        <button className="askForLoan bigBtn" onClick={() => setShowModal(true)}>Mint An NFT</button>
        <Mint onClose={() => setShowModal(false)} giftContractAddress = {giftContractAddress} show={showModal} giftContract = {giftContract}  />
        {/* <Details  loans= {loans} loanContract={loanContract}  getLoans = {getLoans} /> */}
    </div>
  );
};

export default Home;
