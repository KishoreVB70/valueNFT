import { ethers } from "ethers";

export const mint = async (giftContract, performActions, _value, _mintingFee) => {
    try {
        let value = ethers.utils.parseUnits(`${eval(_value) + eval(_mintingFee)}`); ;
        console.log(value);
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.mint(_value).send({from: defaultAccount, value: value});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const redeemcash = async (giftContract, performActions, _tokenId, _value, _redeemFee) => {
    try {
        let value = ethers.utils.parseUnits(`${_value}`) + _redeemFee;
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.redeemCash(_value).send({from: defaultAccount, value: value});
        });
    } catch (e) {
        console.log({e});
    }
};

export const giftnft = async (giftContract, performActions, _tokenId, _receiver) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.giftNft(_tokenId).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};

export const getmintingfee = async (giftContract) => {
    try {
        const value =  await giftContract.methods.getFee().call();
        return value
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


export const getloans = async (giftContract, loanId) => {
    try {
        let details = [];
        for(let i =0; i < loanId; i++){
            let _detail = await giftContract.methods.getDetails(i).call();
          details.push(_detail);
        }
        return details;    
    } catch (e) {
        console.log({e});
    }
};

export const lendmoney = async (_giftContract, performActions, _nftId, amount) => {
    try {
        await performActions(async (kit) => {
            let intAmount = ethers.utils.parseUnits(`${amount}`);
            const {defaultAccount} = kit;
            await _giftContract.methods.lendMoney(_nftId).send({from: defaultAccount, value: intAmount});
        });
    } catch (e) {
        console.log({e});
    }
};


export const repayloan = async (_giftContract, performActions, _nftId, amount) => {
    try {
        await performActions(async (kit) => {
            let intAmount = ethers.utils.parseUnits(`${amount}`);
            const {defaultAccount} = kit;
            await _giftContract.methods.repayLoan(_nftId).send({from: defaultAccount, value: intAmount});
        });
    } catch (e) {
        console.log({e});
    }
};

export const closeborrowrequest = async (_giftContract, performActions, _nftId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await _giftContract.methods.closeBorrowRequest(_nftId).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};
export const ceasenft = async (_giftContract, performActions, _nftId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await _giftContract.methods.ceaseNft(_nftId).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};