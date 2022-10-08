import {useState, useEffect} from "react";
import "../styles/details.css";
import {useContractKit} from "@celo-tools/use-contractkit";
import { ethers } from "ethers";
import { buynft, getlistedtokenid, getlistedtokens, unlistnft } from "../utils/gifter";
import abi from "../contracts/abi.json";




const NftMarketPlace = (props) => {
  const { getConnectedKit, address, performActions } = useContractKit();


  //Contract
  let giftContractAddress = props.giftContractAddress; 
  const [giftContract, setGiftContract] = useState();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);




  const getNfts = async() => {
    const kit = await getConnectedKit();
    let _giftContract = new kit.web3.eth.Contract(abi.abi, giftContractAddress);
    setGiftContract(_giftContract);

    let nftIndex = await getlistedtokenid(_giftContract);
    console.log(nftIndex);
    let _nfts = await getlistedtokens(_giftContract,nftIndex);
    console.log(_nfts);
    setNfts(_nfts);
  }

  useEffect(() => {
    getNfts();
  }, [])

    if(!nfts){
        return(
            <div className="fetching">
            <h1 >Fetching Products...</h1>
            </div>
        );
    }

    const buyNft = async (key, _value) => {
        try {
            setLoading(true)
            await buynft(giftContract, performActions, key, _value);
            await getNfts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    const unListNft = async (_tokenId) => {
        try {
            setLoading(true)
            await unlistnft(giftContract, performActions, _tokenId);
            await getNfts();
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };
    
    return(
        <div className='Details' >
            {nfts.map(  (nft, key) => {
                let isOwner = nft._owner.toLowerCase() == address.toLowerCase();
                let  Amount = ethers.utils.formatEther(nft._tokenValue);

                return(
                    <div className="detail" key={key}>
                        <p>Amount: {Amount} celo</p>
                        <p>Token Id: {nft._tokenId}</p>
                        <p>Owner Address: {nft._owner.substring(0,5)}</p>    
                        {
                            isOwner && (
                                <div>
                                    <button className='newbtn' onClick = {() => unListNft(nft._listedIndex)}>Unlist</button>
                                </div>
                            )
                        }
                        {
                            !isOwner &&(
                                <div>
                                    <button className='newbtn' onClick={() => buyNft(nft._listedIndex, nft._tokenValue)}>Buy</button>
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

export default NftMarketPlace;