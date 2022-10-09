import { useState } from "react";
import '../styles/Modal.css';
import {addproduct} from "../utils/gifter";


import {useContractKit} from "@celo-tools/use-contractkit";

const Mint = (props) => {
    let giftContract = props.giftContract;
    const {performActions} = useContractKit();
    const [loading, setLoading] = useState(false);
    const [nftAmount, setNftAmount] = useState("");
    const [name, setName] = useState("");
    const [celoAmount, setCeloAmount] = useState("");
    const [image, setImage] = useState("");
    const [quantity, setQuantity] = useState("");

    const addProduct = async (_nftValue, _celoValue, _name, _image, _quantity) => {
        try {
            setLoading(true);
            await addproduct(giftContract, performActions, _nftValue, _celoValue, _name, _image, _quantity);
            await props.getProducts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };
        
    if( !props.show ){
        return null;
    }

    return(
        <div className="hider">
            <div className="modal-body">
                <select value={nftAmount} onChange={(e) => setNftAmount(e.target.value)}>
                    <option> No value</option>
                    <option value="1"> 1 </option>
                    <option value="2"> 2 </option>
                    <option value="5"> 5 </option>
                    <option value="10"> 10 </option>
                    <option value="20"> 20 </option>
                </select>
                <input placeholder="amount(celo)" type="number" value={celoAmount} onChange = { (e) => setCeloAmount(e.target.value) } />
                <input placeholder="name" type="string" value={name} onChange = { (e) => setName(e.target.value) } />
                <input placeholder="image URL" type="string" value={image} onChange = { (e) => setImage(e.target.value) } />
                <input placeholder="quantity" type="number" value={quantity} onChange = { (e) => setQuantity(e.target.value) } />
                <button className="newBtn" onClick={
                    () => {
                        addProduct(nftAmount,celoAmount,name,image,quantity);
                        props.onClose();
                    } } >
                    Add Product
                </button>
                <button className="newBtn" onClick={() => props.onClose()} >Close</button>
            </div>
        </div>
    );
}
export default Mint;