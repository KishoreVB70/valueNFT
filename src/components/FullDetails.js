import '../Modal.css';
const Fulldetails = (props) => {
    if( !props.show ){
        return null;
    }
    let detail = props.detail;

    let _loanDurationEndDate = new Date(detail.loanDurationEndTimestamp * 1000 );
    let loanDurationEndDate = _loanDurationEndDate.toLocaleDateString();
    let loanDurationEndTime = _loanDurationEndDate.toLocaleTimeString();

    return(
        <div className="hider">
            <div className="modal-body">
                <p>nftid: {detail.nftId}</p>
                <p>nftAddress: {detail.nftAddress}</p>
                <p>lender: {detail.lenderAddress}</p>
                <p>borrowerAddress: {detail.borrowerAddress}</p>
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