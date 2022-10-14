import { ethers } from "ethers";

export const mint = async (giftContract, performActions, _value, _mintingFee) => {
    try {
        let value = ethers.utils.parseUnits(`${eval(_value) + eval(_mintingFee)}`); ;
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.mint(_value).send({from: defaultAccount, value: value});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const redeemcash = async (giftContract, performActions, _tokenId, _redeemFee) => {
    try {
        let redeemFee = ethers.utils.parseUnits(_redeemFee);
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.redeemCash(_tokenId).send({from: defaultAccount, value: redeemFee});
        });
    } catch (e) {
        console.log({e});
    }
};

export const giftnft = async (giftContract, performActions, _tokenId, _receiver) => {
    try {
        console.log(_tokenId);
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.giftNft(_tokenId, _receiver).send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};

export const getmintingfee = async (giftContract) => {
    try {
        const value =  await giftContract.methods.getmintingFee().call();
        return value
    } catch (e) {
        console.log({e});
    }
};
export const getredeemfee = async (giftContract) => {
    try {
        const value =  await giftContract.methods.getredeemFee().call();
        return value
    } catch (e) {
        console.log({e});
    }
};

//<-----------------------------------------<Listing Section>------------------------------------------------->

export const listnft = async (giftContract, performActions, _tokenId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.listNft(_tokenId).send({from: defaultAccount});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const buynft = async (giftContract, performActions, _tokenId, _value) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.buyNft(_tokenId).send({from: defaultAccount, value: _value});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const unlistnft = async (giftContract, performActions, _tokenId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.unListNft(_tokenId).send({from: defaultAccount});
        }); 
    } catch (e) {
        console.log({e});
    }
};
//<--------------------------------------<Product Section>----------------------------------------------------->
export const addproduct = async (giftContract, performActions, _nftValue, _celoValue, _name, _image, _quantity) => {
    try {
        await performActions(async (kit) => {
            let value = ethers.utils.parseUnits(_celoValue);
            let nftValue = ethers.utils.parseUnits(_nftValue);
            const {defaultAccount} = kit;
            await giftContract.methods.addProduct(nftValue, value,_name, _image, _quantity).send({from: defaultAccount});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const buywithcelo = async (giftContract, performActions, _productId, _value) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.buyWithCelo(_productId).send({from: defaultAccount, value: _value});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const buywithnft = async (giftContract, performActions, _productId, _tokenId) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.buyWithNft(_productId, _tokenId).send({from: defaultAccount});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const changeprice = async (giftContract, performActions, _productId, _price) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.changeCeloPrice(_productId, _price).send({from: defaultAccount});
        }); 
    } catch (e) {
        console.log({e});
    }
};

export const addquantity = async (giftContract, performActions, _productId, _quantity) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await giftContract.methods.addQuantity(_productId, _quantity).send({from: defaultAccount});
        }); 
    } catch (e) {
        console.log({e});
    }
};

//<-------------------------------------------<View Functions>------------------------------------------------->

export const gettokensofowner = async (giftContract) => {
    try {
        const value =  await giftContract.methods.getTokensOfOwner().call();
        return value
    } catch (e) {
        console.log({e});
    }
};

export const gettokenvalue = async (giftContract, _tokenId) => {
    try {
        const value =  await giftContract.methods.getTokenValue(_tokenId).call();
        return value
    } catch (e) {
        console.log({e});
    }
};


export const getlistedtokenid = async (giftContract) => {
    try {
        const value =  await giftContract.methods.getListedTokenId().call();
        return value
    } catch (e) {
        console.log({e});
    }
};

export const getlistedtokens = async (giftContract, tokenId) => {
    try {
        let details = [];
        for(let i =0; i < tokenId; i++){
            let _detail = await giftContract.methods.getListedToken(i).call();
            details.push(_detail);
        }
        return details;    
    } catch (e) {
        console.log({e});
    }
};

export const getproducts = async (giftContract, productId) => {
    try {
        let details = [];
        for(let i =0; i < productId; i++){
            let _detail = await giftContract.methods.getProduct(i).call();
          details.push(_detail);
        }
        return details;    
    } catch (e) {
        console.log({e});
    }
};
export const getproductid = async (giftContract) => {
    try {
        const value =  await giftContract.methods.getProductId().call();
        return value
    } catch (e) {
        console.log({e});
    }
};
