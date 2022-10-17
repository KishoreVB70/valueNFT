import React from 'react'
import { useState, useEffect } from "react";
import Mint from "../components/Mint";
import "../styles/App.css";
import '../styles/Modal.css';

import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";




import abi from "../contracts/abi.json";
import { useContractKit } from "@celo-tools/use-contractkit";
import { gettokensofowner, gettokenvalue, listnft, redeemcash, giftnft, getredeemfee } from "../utils/gifter";


function YourNFTs(props) {
  const { getConnectedKit} = useContractKit();
  const navigate = useNavigate();


  //Contract
  let giftContractAddress = props.giftContractAddress; 
  const [giftContract, setGiftContract] = useState("");
  const [showModal, setShowModal] = useState();
  const [showFull, setShowFull]= useState(false)

  const [loading, setLoading] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState();

  const [nfts, setNfts] = useState([]);
  const { performActions } = useContractKit();


  const getNfts = async() => {
    const kit = await getConnectedKit();
    let _giftContract = new kit.web3.eth.Contract(abi.abi, giftContractAddress);
    setGiftContract(_giftContract);

    let nftsOfUser = await gettokensofowner(_giftContract);

    setNfts([]);

    nftsOfUser.forEach( async(nft) =>{
      let value = await gettokenvalue(_giftContract,nft)
      setNfts(old => [...old, value]);
    });
  }

  const listNft = async (_tokenId) => {
    try {
        setLoading(true)
        await listnft(giftContract, performActions, _tokenId);
        navigate("/nftMarketplace");
    } catch (e) {
        console.log({e})
    } finally {
        setLoading(false)
    }
};
  const giftNft = async (_tokenId, _receiverAddress) => {
    try {
      setLoading(true)
      await giftnft(giftContract, performActions, _tokenId, _receiverAddress);
      await getNfts();
    } catch (e) {
      console.log({e})
    } finally {
      setLoading(false)
    }
  };
  
  const redeemNft = async (_tokenId) => {
    try {
      setLoading(true)
      let _redeemFee = await getredeemfee(giftContract);
      let redeemFee = ethers.utils.formatEther(_redeemFee);
      await redeemcash(giftContract, performActions, _tokenId, redeemFee);
      await getNfts();
    } catch (e) {
        console.log({e})
    } finally {
        setLoading(false)
    }
};

  useEffect(() => {
    getNfts();
  }, [])

  return (
    <div>
        <button className="askForLoan bigBtn" onClick={() => setShowModal(true)}>Mint An NFT</button>
        <Mint onClose={() => setShowModal(false)} getNfts = {getNfts} giftContractAddress = {giftContractAddress} show={showModal} giftContract = {giftContract}  />
        <div className='Details' >
          {nfts.map( (nft, key) => {
            let  value = ethers.utils.formatEther(nft.value);
            return(
              <div className="detail" key={key}>
                <p>Token Id: {nft.token}</p>
                <p>Value: {value}</p>
                {
                  nft._hasListed && (
                    <p>NFT Listed</p>
                  )
                }
                {
                  !nft._hasListed && (
                    <div>
                      <button className='newbtn' onClick = {() => listNft(nft.token)}>List NFT</button>
                      <button className='newbtn' onClick = {() => redeemNft(nft.token)}>Redeem</button>
                      <button className='newbtn' onClick = {() => setShowFull(true)}>Gift</button>
                    </div>
                  )
                }
                {
                  showFull && (
                    <div className="hider">
                      <div className="modal-body">
                        <input placeholder="receiver address" value={receiverAddress} onChange = { (e) => setReceiverAddress(e.target.value) } />
                        <button className='newbtn' onClick = {() => giftNft(nft.token, receiverAddress)}>Gift NFT</button>
                        <button className='newbtn' onClick = {() => setShowFull(false)}>Close</button>
                      </div>
                    </div>
                  )
                }
              </div>
            )
          })}
        </div>
    </div>
  )
}

export default YourNFTs