//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/*
Todo
    1)Add interest
*/

contract NftLoan{

    struct Loan{
        //Amount in celo
        uint256 loanAmount;
        uint256 interest;
        uint256 amountToBeRepayed;
        uint256 nftId;
        uint256 loanDuration;
        uint256 loanIndex;
        uint256 loanDurationEndTimestamp;
        address nftAddress;
        address payable borrower;
        address payable lender;
        Status status;
    }

    enum Status{
        Open,
        Loaned,
        Closed
    }

    mapping(uint => Loan) loanList;

    uint256 public loanId;

    //Modifiers

    modifier onlyBorrower(uint _loanId){
        require(msg.sender == loanList[_loanId].borrower, "Only the borrower can access this function");
        _;
    }

    modifier isOpen(uint _loanId){
        require(loanList[_loanId].status == Status.Open, "Loan is not Open");
        _;
    }

    modifier isLoaned(uint _loanId){
        require(loanList[_loanId].status == Status.Loaned, "The loan is not in loaned state");
        _;
    }

    //Events
    event newLoan(address borrower, uint indexed loanId);

    event loaned(address borrower, address lender, uint indexed loanId, uint loanAmount);

    event requestClosed(address borrower, uint indexed loanId);

    event loanRepayed(address borrower, address lender, uint indexed loanId, uint loanAmount );

    event nftCeased(address borrower, address  lender, uint indexed loanId);

//----------------------------------------------------------------------------------------------------------------------
    
    //Function using which the users can make a loan request
    function askForLoan(uint256 _nftId, address _nft, uint256 _amount,  uint256 _loanDuration, uint256 _interest) public{
        IERC721(_nft).transferFrom(msg.sender, address(this), _nftId);
        uint256 amountToBeRepayed = _amount + mulDiv(_amount, _interest, 100);
        loanList[loanId] = Loan(_amount, _interest, amountToBeRepayed,  _nftId, _loanDuration, loanId, 0 , _nft,  payable(msg.sender), payable(address(0)), Status.Open );
        emit newLoan(msg.sender, loanId);
        loanId++;
    }

    //Other users can view the request details and use this function to lend money
    function lendMoney(uint _loanId) public payable isOpen(_loanId){
        Loan storage loan = loanList[_loanId];
        require(msg.sender != loan.borrower, "You cannot loan yourself");
        require(msg.value == loan.loanAmount, "send correct loanAmount");
        (bool success, ) = loan.borrower.call{value: msg.value}("");
        require(success, "Payment to buy lot failed");
        loan.loanDurationEndTimestamp = block.timestamp + loan.loanDuration * 60;
        loan.lender = payable(msg.sender);
        loan.status = Status.Loaned;
        emit loaned(loan.borrower, loan.lender, _loanId, loan.loanAmount);
    }

    //If no one lends money in the particular window, users can close the request and get their NFT back
    function closeBorrowRequest(uint _loanId) public onlyBorrower(_loanId) isOpen(_loanId){
        Loan storage loan = loanList[_loanId];
        IERC721(loan.nftAddress).transferFrom(address(this), msg.sender, loan.nftId);
        loan.status = Status.Closed;
        emit requestClosed(msg.sender, _loanId);
    }
    
    //Function using which the borrower can return the money and get his NFT back
    function repayLoan(uint _loanId) public payable onlyBorrower(_loanId) isLoaned(_loanId){
        Loan storage loan = loanList[_loanId];
        require(loan.loanDurationEndTimestamp > block.timestamp, "Loan duration Ended");
        require(msg.value == loan.amountToBeRepayed, "send correct loanAmount");
        (bool success, ) = loan.lender.call{value: msg.value}("");
        require(success, "Payment to buy lot failed");
        IERC721(loan.nftAddress).transferFrom(address(this), msg.sender, loan.nftId);
        loan.status = Status.Closed;
        emit loanRepayed(msg.sender, loan.lender, _loanId, loan.loanAmount);
    }

    //If the borrower fails to pay back the money, after the loan duration ends, the nft is transfered the lender
    function ceaseNft(uint _loanId) public isLoaned(_loanId){
        Loan storage loan = loanList[_loanId];
        require(msg.sender == loan.lender, "Only the lender can cease the NFT");
        require(loan.loanDurationEndTimestamp < block.timestamp, "Loan duration not over");
        IERC721(loan.nftAddress).transferFrom(address(this), msg.sender, loan.nftId);
        loan.status = Status.Closed;
        emit nftCeased(loan.borrower, loan.lender, _loanId);
    }
    
    function mulDiv (uint x, uint y, uint z) internal pure returns (uint){
        uint a = x / z; uint b = x % z; // x = a * z + b
        uint c = y / z; uint d = y % z; // y = c * z + d
        return a * b * z + a * d + b * c + b * d / z;
    }

    //View funciton that returns the required details of the loan
    function getDetails(uint _loanId) public view returns(uint loanAmount, uint interest, uint amountToBeRepayed, uint nftId, uint loanDuration, uint loanDurationEndTimestamp, uint loanIndex, address nftAddress, address payable borrowerAddress, address payable lenderAddress, Status status){
        Loan storage loan = loanList[_loanId];
        return(
            loan.loanAmount,
            loan.interest,
            loan.amountToBeRepayed,
            loan.nftId,
            loan.loanDuration,
            loan.loanDurationEndTimestamp,
            loan.loanIndex,
            loan.nftAddress,
            loan.borrower,
            loan.lender,
            loan.status
        );
    }

    //View the Id
    function getId() public view returns(uint id){
        return loanId;
    }

}