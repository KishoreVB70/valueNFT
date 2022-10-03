import { useState } from "react";
import '../Modal.css';
import {askforloan, getallowance} from "../utils/loaner";
import nftabi from "../contracts/nftAbi.json";

import {useContractKit} from "@celo-tools/use-contractkit";


const Input = (props) => {
    let loanContract = props.loanContract;
    const { getConnectedKit} = useContractKit();
    const {performActions} = useContractKit();
    let loanContractAddress = props.loanContractAddress;
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [interest, setInterest] = useState("");
    const [nftId, setNftId] = useState("");
    const [nftAddress, setNftAddress] = useState("");
    const [loanDuration, setLoanDuration] = useState("");

    const askForLoan = async (_nftId, _nftAddress, _amount,  _loanDuration, _interest) => {
        try {
            setLoading(true);
            await getAllowance(_nftId, _nftAddress);
            await askforloan(loanContract, performActions, _nftId, _nftAddress, _amount, _loanDuration, _interest);
            await props.getLoans();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };
        
    const getAllowance = async ( _nftId, _nftAddress) => {
        try {
                
            const kit = await getConnectedKit();
            const nftContract = new kit.web3.eth.Contract(nftabi.abi, _nftAddress);
            await getallowance(nftContract, performActions, _nftId, loanContractAddress);

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
                <input placeholder="amount(celo)" type="number" value={amount} onChange = { (e) => setAmount(e.target.value) } />
                <input placeholder="nftAddress" value={nftAddress} onChange = { (e) => setNftAddress(e.target.value) } />
                <input placeholder="nftId" type="number" value={nftId} onChange = { (e) => setNftId(e.target.value) } />
                <input placeholder="interest" type="number" value={interest} onChange = { (e) => setInterest(e.target.value) } />
                <input placeholder="loanDuration(minutes)" type="number" value={loanDuration} onChange = { (e) => setLoanDuration(e.target.value) } />
                <button className="newBtn" onClick={
                    () => {
                        console.log("clicked");
                        askForLoan(nftId, nftAddress, amount,  loanDuration, interest);
                        props.onClose()
                    } } >Ask for Loan</button>
                <button className="newBtn" onClick={() => props.onClose()} >Close</button>
            </div>
        </div>
    );
}
export default Input;