import {useState} from "react";
import "../styles/details.css";
import '../styles/Modal.css';

import {useContractKit} from "@celo-tools/use-contractkit";
import { ethers } from "ethers";
import { changeprice, addquantity, buywithcelo, buywithnft } from "../utils/gifter";



const Details = (props) => {
    const { address, performActions } = useContractKit();

    const [loading, setLoading] = useState(false);
    const [showFull, setShowFull]= useState(false)

    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [tokenId, setTokenId] = useState('');

    let giftContract = props.giftContract;

    let products = props.products;

    if(!products){
        return(
            <div className="fetching">
            <h1 >Fetching Products...</h1>
            </div>
        );
    }

    const buyWithCelo = async (key, _value) => {
        try {
            setLoading(true)
            await buywithcelo(giftContract, performActions, key, _value);
            await props.getProducts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    const buyWithNft = async (key, _tokenId) => {
        try {
            setLoading(true)
            await buywithnft(giftContract, performActions, key, _tokenId);
            await props.getProducts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    const changePrice = async (key, price) => {
        try {
            console.log(key);
            setLoading(true)
            await changeprice(giftContract, performActions, key, price);
            await props.getProducts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    const addQuantity = async (key, quantity) => {
        try {
            console.log(key);
            setLoading(true)
            await addquantity(giftContract, performActions, key, quantity);
            await props.getProducts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };


    return(
        <div className='Details' >
            {products.map(  (product, key) => {
                let isOwner = product.seller.toLowerCase() == address.toLowerCase();
                let  celoAmount = ethers.utils.formatEther(product.celoPrice);
                let  nftAmount = product.price

                return(
                    <div className="detail" key={key}>
                        <h3>{product.name}</h3>
                        <p>Description: {product.description}</p>
                        <p>Amount: {celoAmount} celo</p>
                        <p>NFT Amount: {nftAmount}</p>
                        <p>Seller Address: {product.seller.substring(0,5)}</p>
                        {
                            isOwner && (
                                <div>
                                    <button className='newbtn' onClick = {() => setShowFull(true)}>Edit Product</button>
                                </div>
                            )
                        }
                        {
                            !isOwner &&(
                                <div>
                                    <button className='newbtn' onClick={() => buyWithCelo(product.productIndex, product.celoPrice)}>Buy with Celo</button>
                                    <input placeholder="token ID" type="number" value={tokenId} onChange = { (e) => setTokenId(e.target.value) } />
                                    <button className='newbtn' onClick={() => buyWithNft(product.productIndex, tokenId)}>Buy with NFT</button>
                                </div>
                            )
                        }
                        {
                            showFull &&(
                                <div className="hider">
                                    <div className="modal-body" >
                                        <input placeholder="new price" type="number" value={price} onChange = { (e) => setPrice(e.target.value) } />
                                        <button className='newbtn' onClick = {() => changePrice(product.productIndex, price)}> Change Price </button>
                                        <input placeholder="Quantity" type="number" value={quantity} onChange = { (e) => setQuantity(e.target.value) } />
                                        <button className='newbtn' onClick = {() => addQuantity(product.productIndex, quantity)}>Add Quantity</button>
                                        <button className='newbtn' onClick = {() => setShowFull(false)}>Close</button>
                                    </div>
                                </div>
                            ) 
                        }
                    </div>
                ) 
            })
            }
        </div>        
    )
}

export default Details;