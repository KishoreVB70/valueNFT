import { useState } from "react";
import '../Modal.css';
import {mint, getmintingfee} from "../utils/gifter";

import {useContractKit} from "@celo-tools/use-contractkit";
import { ethers } from "ethers";



const Input = (props) => {
    let giftContract = props.giftContract;
    const {performActions} = useContractKit();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");


    const mintFunction = async (_value) => {
        try {
            let _intValue = parseInt(_value);
            setLoading(true);
            let _mintingFee = await getmintingfee(giftContract);
            _mintingFee = ethers.utils.formatEther(_mintingFee);
            await mint(giftContract, performActions, _intValue, _mintingFee);
            await props.getLoans();
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
                <p>Fill the required information </p>
                <select value={amount} onChange={(e) => setAmount(e.target.value)}>
                    <option value="1"> No value</option>
                    <option value="1"> 1 </option>
                    <option value="2"> 2 </option>
                    <option value="5"> 5 </option>
                    <option value="10"> 10 </option>
                    <option value="20"> 20 </option>
                </select>
                <p>{`Selected value - ${amount}`}</p>
                <button className="newBtn" onClick={
                    () => {
                        mintFunction(amount);
                        props.onClose()
                    } } >Mint</button>
                <button className="newBtn" onClick={() => props.onClose()} >Close</button>
            </div>
        </div>
    );
}
export default Input;