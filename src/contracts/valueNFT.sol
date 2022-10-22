// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ValueNFT is ERC721, ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;

    //Trackers
    Counters.Counter tokenId;
    Counters.Counter productId;
    Counters.Counter listedTokenId;

    //Deployer of the contract
    address payable owner;

    struct ListedToken {
        uint256 tokenId;
        uint256 tokenValue;
        address payable owner;
    }

    struct Product {
        uint256 productIndex;
        uint256 celoPrice;
        uint256 price;
        uint256 itemsAvailable;
        uint256 totalItemsSold;
        uint256 itemsSoldByNft;
        string name;
        string image;
        address payable seller;
    }

    mapping(uint256 => Product) products;
    mapping(uint256 => ListedToken) listedTokens;

    mapping(uint256 => uint256) tokenValue;

    //Array of all the tokenId a address owns
    mapping(address => uint256[]) tokensOfOwner;

    // Token is listed for sale or not
    mapping(uint256 => bool) hasListed;

    //Fee
    uint256 mintingFee = 0.1 ether;
    uint256 redeemFee = 0.1 ether;

    constructor() ERC721("Value NFT", "VAL") {
        owner = payable(msg.sender);
    }

    //Modifiers

    modifier isValid(uint256 _input) {
        require(_input > 0, "invalid input");
        _;
    }

    modifier tokenExists(uint256 _listedTokenId) {
        require(listedTokenId.current() >= _listedTokenId, "does not exist");
        _;
    }

    modifier notListed(uint256 _tokenId) {
        require(!hasListed[_tokenId], "Token is listed");
        _;
    }

    modifier onlyOwner(uint256 _tokenId) {
        require(msg.sender == ownerOf(_tokenId), "Not the owner");
        _;
    }

    modifier correctMsgValue(uint256 _msgValue) {
        require(msg.value == _msgValue, "send correct value");
        _;
    }

    modifier onlySeller(uint256 _productId) {
        require(
            msg.sender == products[_productId].seller,
            "only the seller can access this function"
        );
        _;
    }

    modifier notSeller(uint256 _productId) {
        require(msg.sender != products[_productId].seller, "Owner cannot buy");
        _;
    }

    modifier isAvailable(uint256 _productId) {
        require(products[_productId].itemsAvailable > 0, "out of stock");
        _;
    }

    // Owner function
    function changeFee(uint256 _mintingFee, uint256 _redeemFee)
        public
        isValid(_mintingFee)
        isValid(_redeemFee)
    {
        require(msg.sender == owner, "only owner");
        mintingFee = _mintingFee;
        redeemFee = _redeemFee;
    }

    // Functions involving purely the NFT

    /// @dev mint an nft for a predetermined value (1/2/5/10/20). along with a mint fee
    /// @param _value in normal integer converted to ether
    function mint(uint256 _value)
        external
        payable
        correctMsgValue((_value * 1 ether) + mintingFee)
    {
        require(
            _value == 1 ||
                _value == 2 ||
                _value == 5 ||
                _value == 10 ||
                _value == 20
        );
        uint256 newId = tokenId.current();
        tokenId.increment();
        _mint(msg.sender, newId);
        tokenValue[newId] = _value * 1 ether;
        tokensOfOwner[msg.sender].push(newId);
    }

    /// @dev burn the nft to get cash back with a redeem fee
    function redeemCash(uint256 _tokenId)
        external
        payable
        correctMsgValue(redeemFee)
        onlyOwner(_tokenId)
        notListed(_tokenId)
        nonReentrant
    {
        uint256 value = tokenValue[_tokenId];
        tokenValue[_tokenId] = 0;
        (bool success, ) = payable(msg.sender).call{value: value}("");
        require(success, "Payment failed");
        _burn(_tokenId);

        //Remove token from user array
        tokensOfOwner[msg.sender] = removeFromArray(
            tokensOfOwner[msg.sender],
            _tokenId
        );
    }

    /// @dev send nft to any address without any fee
    function giftNft(uint256 _tokenId, address _receiver)
        external
        onlyOwner(_tokenId)
        notListed(_tokenId)
    {
        require(_receiver != address(0), "invalid address");
        _transfer(msg.sender, _receiver, _tokenId);
        tokensOfOwner[_receiver].push(_tokenId);
        //Remove token from user
        tokensOfOwner[msg.sender] = removeFromArray(
            tokensOfOwner[msg.sender],
            _tokenId
        );
    }

    //Functions involving Listed NFT

    /// @dev add an nft for sane
    function listNft(uint256 _tokenId)
        external
        onlyOwner(_tokenId)
        notListed(_tokenId)
    {
        listedTokens[listedTokenId.current()] = ListedToken(
            _tokenId,
            tokenValue[_tokenId],
            payable(msg.sender)
        );
        hasListed[_tokenId] = true;
        listedTokenId.increment();
    }

    /// @dev buy any nft in sale
    function buyNft(uint256 _listedTokenId)
        external
        payable
        tokenExists(_listedTokenId)
        correctMsgValue(listedTokens[_listedTokenId].tokenValue)
        nonReentrant
    {
        ListedToken storage listedToken = listedTokens[_listedTokenId];
        require(msg.sender != listedToken.owner, "Owner can't buy NFT");

        (bool success, ) = listedToken.owner.call{value: msg.value}("");
        require(success, "Payment failed");

        //Delete token from the user
        tokensOfOwner[listedToken.owner] = removeFromArray(
            tokensOfOwner[listedToken.owner],
            listedToken.tokenId
        );
        _transfer(listedToken.owner, msg.sender, listedToken.tokenId);
        tokensOfOwner[msg.sender].push(listedToken.tokenId);

        delete listedTokens[_listedTokenId];
    }

    /// @dev funciton for oowner to unlist nft
    function unListNft(uint256 _listedTokenId)
        external
        onlyOwner(listedTokens[_listedTokenId].tokenId)
        tokenExists(_listedTokenId)
    {
        hasListed[listedTokens[_listedTokenId].tokenId] = false;
        delete listedTokens[_listedTokenId];
    }

    // Product functions

    /// @dev add product for sale(nft price less than celo price for economics)
    /// @param _image is url
    function addProduct(
        uint256 _price,
        uint256 _celoPrice,
        string calldata _name,
        string calldata _image,
        uint256 _quantity
    ) external {
        require(_price < _celoPrice, "price for NFT transfer should be low");
        require(
            _price == 1 ether ||
                _price == 2 ether ||
                _price == 5 ether ||
                _price == 10 ether ||
                _price == 20 ether,
            "Not correct amount"
        );
        products[productId.current()] = Product(
            productId.current(),
            _celoPrice,
            _price,
            _quantity,
            0,
            0,
            _name,
            _image,
            payable(msg.sender)
        );
        productId.increment();
    }

    /// @dev buy a product with celo for higher price
    function buyWithCelo(uint256 _productId)
        public
        payable
        correctMsgValue(products[_productId].celoPrice)
        notSeller(_productId)
        isAvailable(_productId)
        nonReentrant
    {
        Product storage currentProduct = products[_productId];
        (bool success, ) = currentProduct.seller.call{value: msg.value}("");
        require(success, "Payment failed");
        currentProduct.totalItemsSold++;
        currentProduct.itemsAvailable--;
    }

    /// @dev buy a product with nft for lower price
    function buyWithNft(uint256 _productId, uint256 _tokenId)
        public
        payable
        notSeller(_productId)
        isAvailable(_productId)
        notListed(_tokenId)
        nonReentrant
    {
        Product storage currentProduct = products[_productId];
        require(
            tokenValue[_tokenId] == products[_productId].price,
            "not correct nft"
        );

        _transfer(msg.sender, products[_productId].seller, _tokenId);
        tokensOfOwner[msg.sender] = removeFromArray(
            tokensOfOwner[msg.sender],
            _tokenId
        );
        tokensOfOwner[currentProduct.seller].push(_tokenId);

        currentProduct.totalItemsSold++;
        currentProduct.itemsSoldByNft++;
        currentProduct.itemsAvailable--;

        if (currentProduct.itemsSoldByNft % 3 == 0) {
            (bool success, ) = currentProduct.seller.call{value: mintingFee}(
                ""
            );
            require(success, "payment Failed");
        }
    }

    /// @dev Allows the seller to Change the price
    function changeCeloPrice(uint256 _productId, uint256 _price)
        public
        onlySeller(_productId)
        isValid(_price)
    {
        require(_price > products[_productId].price, "invalid price");
        products[_productId].celoPrice = _price;
    }

    /// @dev Allows the seller to add products
    function addQuantity(uint256 _productId, uint256 _quantity)
        public
        onlySeller(_productId)
        isValid(_quantity)
    {
        products[_productId].itemsAvailable += _quantity;
    }

    /// @dev Helper function to remove token from user
    function removeFromArray(uint256[] storage array, uint256 _tokenId)
        internal
        returns (uint256[] memory)
    {
        if (array.length == 0) {
            array.pop();
            return array;
        }

        //Identify the index of the token
        uint256 index;
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == _tokenId) {
                index = i;
            }
        }

        //Removing the element from the index
        array[index] = array[array.length - 1];
        array.pop();
        return array;
    }

    // View functions

    function getFees() public view returns (uint256, uint256) {
        return (redeemFee, mintingFee);
    }

    function getTokenId() public view returns (uint256) {
        return tokenId.current();
    }

    function getProductId() public view returns (uint256) {
        return productId.current();
    }

    function getListedTokenId() public view returns (uint256) {
        return listedTokenId.current();
    }

    function getTokensOfOwner() public view returns (uint256[] memory) {
        return tokensOfOwner[msg.sender];
    }

    function getTokenValue(uint256 _tokenId)
        public
        view
        returns (
            uint256 token,
            uint256 value,
            bool _hasListed
        )
    {
        return (_tokenId, tokenValue[_tokenId], hasListed[_tokenId]);
    }

    function getProduct(uint256 _productId)
        public
        view
        returns (
            uint256 productIndex,
            uint256 price,
            uint256 celoPrice,
            uint256 itemsSold,
            string memory name,
            string memory image,
            address seller
        )
    {
        return (
            products[_productId].productIndex,
            products[_productId].price,
            products[_productId].celoPrice,
            products[_productId].totalItemsSold,
            products[_productId].name,
            products[_productId].image,
            products[_productId].seller
        );
    }

    function getListedToken(uint256 _listedTokenId)
        public
        view
        returns (
            uint256 _tokenId,
            uint256 _tokenValue,
            address _owner,
            bool _hasListed
        )
    {
        return (
            listedTokens[_listedTokenId].tokenId,
            listedTokens[_listedTokenId].tokenValue,
            listedTokens[_listedTokenId].owner,
            hasListed[listedTokens[_listedTokenId].tokenId]
        );
    }

    // overrides required by Solidity

    /// @dev See {IERC721-transferFrom}.
    function transferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public override {
        super.transferFrom(from, to, _tokenId);
    }

    /// @dev See {IERC721-safeTransferFrom}.
    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory data
    ) public override {
        _safeTransfer(from, to, _tokenId, data);
    }

    function _burn(uint256 _tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(_tokenId);
    }
}
