import { ethers } from "ethers";

export const askforloan = async (loanContract, performActions, _nftId, _nftAddress, _amount,  _loanDuration, _interest) => {
    try {
        let amount = ethers.utils.parseUnits(`${_amount}`);
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await loanContract.methods.askForLoan(_nftId, _nftAddress, amount,  _loanDuration, _interest).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};

export const getallowance = async (nftContract, performActions,  _nftId, contractAddress) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await nftContract.methods.approve(contractAddress, _nftId).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};

export const getloanid = async (loanContract) => {
    try {
        const value =  await loanContract.methods.getId().call();
        return value
    } catch (e) {
        console.log({e});
    }
};

export const getloans = async (loanContract, loanId) => {
    try {
        let details = [];
        for(let i =0; i < loanId; i++){
            let _detail = await loanContract.methods.getDetails(i).call();
          details.push(_detail);
        }
        return details;    
    } catch (e) {
        console.log({e});
    }
};

export const lendmoney = async (_loanContract, performActions, _nftId, amount) => {
    try {
        await performActions(async (kit) => {
            let intAmount = ethers.utils.parseUnits(`${amount}`);
            const {defaultAccount} = kit;
            await _loanContract.methods.lendMoney(_nftId).send({from: defaultAccount, value: intAmount});
        });
    } catch (e) {
        console.log({e});
    }
};


export const repayloan = async (_loanContract, performActions, _nftId, amount) => {
    try {
        await performActions(async (kit) => {
            let intAmount = ethers.utils.parseUnits(`${amount}`);
            const {defaultAccount} = kit;
            await _loanContract.methods.repayLoan(_nftId).send({from: defaultAccount, value: intAmount});
        });
    } catch (e) {
        console.log({e});
    }
};

export const closeborrowrequest = async (_loanContract, performActions, _nftId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await _loanContract.methods.closeBorrowRequest(_nftId).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};
export const ceasenft = async (_loanContract, performActions, _nftId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await _loanContract.methods.ceaseNft(_nftId).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};