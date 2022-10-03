import '../Modal.css';
import { ethers } from "ethers";

const Fulldetails = (props) => {
    if( !props.show ){
        return null;
    }
    let detail = props.detail;

    let _loanDurationEndDate = new Date(detail.loanDurationEndTimestamp * 1000 );
    let loanDurationEndDate = _loanDurationEndDate.toLocaleDateString();
    let loanDurationEndTime = _loanDurationEndDate.toLocaleTimeString();
    let amountToBeRepayed = ethers.utils.formatEther(detail.amountToBeRepayed);
    let lenderAddress;
    if(detail.lenderAddress == 0){
        lenderAddress = "No lender"
    }else{
        lenderAddress = detail.lenderAddress;
    }


    return(
        <div className="hider">
            <div className="modal-body">
                <p>nftid: {detail.nftId}</p>
                <p>nftAddress: {detail.nftAddress}</p>
                <p>Borrower: {detail.borrowerAddress}</p>
                <p>lender: {lenderAddress}</p>
                <p>Amount after Interest: {amountToBeRepayed} </p>
                {
                    detail.status == 1 && (
                        <p>Loan Duration till: {loanDurationEndTime} of {loanDurationEndDate}</p>
                    )
                }
                <button onClick={() => props.onClose()} >Close</button>
            </div>
        </div>
    )
}

export default Fulldetails;