import React from "react";

import { Container, Nav } from "react-bootstrap";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Notification } from "./ui/Notifications";
import Wallet from "./Wallet";
import Cover from "./Cover";
import Input from "./Input";
import { useBalance} from "../hooks";
import { useState} from "react";


import "../App.css";

const Home = function AppWrapper(props) {
  const [showModal, setShowModal] = useState();
  const { address, destroy, connect } = useContractKit();
  const { balance } = useBalance();
  let giftContractAddress = "0x7DC1053980863d941CCB4C5Abb60E4460Cc88f91"; 
  let giftContract = props.giftContract;


  return (
    <>
      <Notification />
      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
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
                  <button className="askForLoan bigBtn" onClick={() => setShowModal(true)}>Mint An NFT</button>
                  <Input onClose={() => setShowModal(false)} giftContractAddress = {giftContractAddress} show={showModal} giftContract = {giftContract}  />
                  {/* <Details  loans= {loans} loanContract={loanContract}  getLoans = {getLoans} /> */}
            </div>
          </main>
        </Container>
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

export default Home;
