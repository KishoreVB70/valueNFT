import React from 'react'
import "../styles/App.css";

import Productinput from "../components/Productinput";
import ProductDetails from "../components/ProductDetails";

import { useState, useEffect } from "react";
import { getproductid, getproducts } from "../utils/gifter";
import abi from "../contracts/abi.json";
import { useContractKit } from "@celo-tools/use-contractkit";


function Products(props) {
  const { getConnectedKit} = useContractKit();

  //State
  const [showModal, setShowModal] = useState();
  const [products, setProducts] = useState();

  //Contract
  let giftContractAddress = props.giftContractAddress; 
  const [giftContract, setGiftContract] = useState();


  const getProducts = async() => {
    const kit = await getConnectedKit();
    let _giftContract = new kit.web3.eth.Contract(abi.abi, giftContractAddress);
    setGiftContract(_giftContract);

    let productId = await getproductid(_giftContract);
    let productsUh = await getproducts(_giftContract, productId);
    setProducts(productsUh);
  }

  useEffect(() => {
    getProducts();
  }, [])
  
  return (
    <div>
        <button className="askForLoan bigBtn" onClick={() => setShowModal(true)}>Add a Product</button>
        <Productinput onClose={() => setShowModal(false)} giftContractAddress = {giftContractAddress} show={showModal} giftContract = {giftContract} getProducts = {getProducts} />
        <ProductDetails  products= {products} giftContract={giftContract}  getProducts = {getProducts} />
    </div>
  );
}

export default Products