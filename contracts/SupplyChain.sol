pragma solidity ^0.8.0;

contract RetailSupplyChain {

    enum Participants {
        manufacturer,
        distributer,
        retailer,
        customer
    }

    /*
    * Struct to model the product information
    */
    struct Product {
        uint productID;
        string productName;
        string brand;
        string location;
        uint dateTime;
        uint price;
        address payable owner;
    }

    /*
    * Struct to model the Shipment details
    */
    struct ShipmentDetails {
		uint productID;
		string transportAgencyName;
		string destAddress;
	}

    /*
    * Struct to model the tracking information
    */
    struct TrackDetails {
		string owner;
		string location;
		string description;
		uint time;
	}

    bytes32[] internal trackByteArray; 
    TrackDetails[] internal trackInfo;
    mapping (uint => Product) inventory;
	mapping (uint => ShipmentDetails) shipmentInfo;
	mapping (uint => TrackDetails[]) trackInfoMap;

    address internal manufacturer;
    address internal retailer;
    address internal distributer; 

    /*
    * Defining default constructor
    */
    constructor() {}

    /*
    * Returns the current owner of the product 
    */
    function getOwnerAddress(uint _productID) public view returns (address){
		return inventory[_productID].owner;
	}

    /*
    * Allows the Manufacturer to create a new product and add * it to the inventory
    */
    function addProduct(uint productID, 
                        string memory productName, 
                        string memory brand, 
                        string memory location) public {
        
        // Assurance that there is no other product with the same id
        require(inventory[productID].productID != productID);

        uint timestamp = block.timestamp;

        manufacturer = msg.sender;

        // Update product information
        inventory[productID].productID = productID;
        inventory[productID].productName = productName;
        inventory[productID].brand = brand;
		inventory[productID].location = location;
		inventory[productID].dateTime = timestamp;
        inventory[productID].owner = payable(msg.sender);

        // Update tracking information
        TrackDetails memory track = TrackDetails("Manufacturing Unit", location, "Product Manufactured", timestamp);
    	trackInfo.push(track);
		trackInfoMap[productID] = trackInfo;
    }

    /*
    * Change the locaction of the product
    */
    function shipProduct(uint productID, 
                         string memory transportAgencyName, string memory destAddress, 
                         Participants partType, 
                         address payable ownerAddr)  public { 
        
        require(inventory[productID].productID == productID);
        
        // Update tracking information and check requirements
        TrackDetails memory track;
        uint timestamp = block.timestamp;

        if (partType == Participants.manufacturer) {
			require(msg.sender == manufacturer);

			distributer = ownerAddr;
		    track = TrackDetails("Manufacturer", 
                                 destAddress, 
                                 "Product Shipped", 
                                 timestamp);

        } else if (partType == Participants.distributer) {
		    require(msg.sender == distributer);

			retailer = ownerAddr;
            track = TrackDetails("Distributer", 
                                 destAddress, 
                                 "Product Shipped", 
                                 timestamp);
        }
        
        shipmentInfo[productID].productID = productID;
        shipmentInfo[productID].transportAgencyName = transportAgencyName;
		shipmentInfo[productID].destAddress = destAddress;


        // Transfer ownership
        inventory[productID].owner = ownerAddr;
    	trackInfo.push(track);
		trackInfoMap[productID] = trackInfo;
    }
    
    /*
    * list the product on the market setting the price
    */
    function sellProduct(uint productID, 
                         string memory transportAgencyName, string memory destAddress, 
                         uint price) public {
        
        require(inventory[productID].productID == productID);
        require(msg.sender == getOwnerAddress(productID));

        // Updates product information
        shipmentInfo[productID].productID = productID;
        shipmentInfo[productID].transportAgencyName = transportAgencyName;
		shipmentInfo[productID].destAddress = destAddress;

        inventory[productID].price = price;

        // Updates tracking information
        inventory[productID].price = price;
        TrackDetails memory track;
        track = TrackDetails("Retailer", 
                             destAddress, 
                             "Product Shipped", 
                             block.timestamp);
    	trackInfo.push(track);
		trackInfoMap[productID] = trackInfo;

        //TrackInfo
    }

    /*
    * Transfer the ownership of the product to the buyer
    */
    function buyProduct(uint _productID) public payable {
        
        Product memory _product = inventory[_productID];
        
        // Fetch the owner
        address payable _seller = _product.owner;

        require(msg.value >= _product.price);
        require(_product.productID == _productID);

        // Require that the buyer is not the seller
        require(_seller != msg.sender);

        // Pay the seller by sending them Ether
        _seller.transfer(msg.value);

        // Transfer ownership to the buyer
        inventory[_productID].owner = payable(msg.sender);
    }

    /*
    * Utils method
    */
    function stringToBytes32(string memory _source) internal pure returns (bytes32 result_) {
        bytes memory tempEmptyStringTest = bytes(_source);
        
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
    
        assembly {
            result_ := mload(add(_source, 32))
        }
    }

    /*
    * Returns all the hystory for the product
    */
    function listAllTrackInfo(uint productID) public returns ( bytes32[] memory){
        
        TrackDetails[] memory trackDetails = trackInfoMap[productID];
    	
        uint iterator;
        for(iterator = 0;iterator < trackInfoMap[productID].length; iterator++){
            trackByteArray.push(stringToBytes32(trackDetails[iterator].owner));
            trackByteArray.push(stringToBytes32(trackDetails[iterator].location));
            trackByteArray.push(stringToBytes32(trackDetails[iterator].description));
            trackByteArray.push(bytes32(trackDetails[iterator].time));
        }
        return trackByteArray;
    }

    /*
    * Return the current information of the product
    */
    function getTrackInfo(uint productID, uint index) public view returns(string memory owner, 
                 string memory location, 
                 string memory description, 
                 uint time) {
		TrackDetails[] memory trackDetails = trackInfoMap[productID];
		
        return (trackDetails[index].owner,
                trackDetails[index].location,
                trackDetails[index].description,
                trackDetails[index].time);
	}
}