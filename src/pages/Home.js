import React from "react";
import Input from "../components/Input";
import { useState} from "react";


import "../styles/App.css";

const Home = function AppWrapper(props) {
  const [showModal, setShowModal] = useState();
  let giftContractAddress = "0x7DC1053980863d941CCB4C5Abb60E4460Cc88f91"; 
  let giftContract = props.giftContract;


  return (
    <div>
        <button className="askForLoan bigBtn" onClick={() => setShowModal(true)}>Mint An NFT</button>
        <Input onClose={() => setShowModal(false)} giftContractAddress = {giftContractAddress} show={showModal} giftContract = {giftContract}  />
        {/* <Details  loans= {loans} loanContract={loanContract}  getLoans = {getLoans} /> */}
    </div>
  );
};

export default Home;
