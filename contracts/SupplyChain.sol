pragma solidity ^0.8.0;

import './Ownable.sol';
import './roles/ManufacturerRole.sol';
import './roles/RetailerRole.sol';

contract RetailSupplyChain is Ownable, ManufacturerRole, RetailerRole {

    // Define enum 'State' with the following values:
    enum State{
        for_sale,
        purchased,    
        shipped,         
        Received               
    }

    State constant default_state = State.for_sale;

    /*
    * Struct to model the product information
    */
    struct Item {
        uint upc;  // Universal Product Code (UPC)
        string productName;
        State item_state;
        history[] item_history;

        uint price;
    }

    struct history {
        address owner;
        uint time;
    }

    // Define a public mapping 'items' that maps the UPC to an Item.
    mapping (uint => Item) products;


    modifier availableUPC(uint upc, uint8 quantity) {
        for(uint8 i=0; i<quantity; i++){
            require(bytes(products[upc+i].productName).length == 0, "Some UPC are not available");
        }
        _;
    }

    // Define a modifer that checks to see if msg.sender == owner of the contract
    modifier is_product_owner(uint upc) {
        require(msg.sender == get_owner(upc), "The caller is not the owner of the product");
        _;
    }

    modifier is_correct_state(uint upc, State state){
        require(products[upc].item_state == state, "This operation cannot be carried out in this moment");
        _;
    }

    // Define a modifier that checks if the paid amount is sufficient to cover the price
    modifier paid_enough(uint _price) {
        require(msg.value >= _price, "Not enough founds");
        _;
    }

    function get_owner(uint upc) private view returns(address){
        uint len = products[upc].item_history.length;
        return products[upc].item_history[len-1].owner;
    }

    function get_prev_owner(uint upc) private view returns(address){
        uint len = products[upc].item_history.length;
        if (len > 1) 
            return products[upc].item_history[len-2].owner;
        else
            return products[upc].item_history[len-1].owner;
    }

    function get_manufacturer(uint upc) private view returns(address){
        return products[upc].item_history[0].owner;
    }

    function add_history(uint upc, address owner, uint time) private {
        products[upc].item_history.push(history(owner, time));
    }

    function add_product(uint upc, string memory productName, uint8 quantity, uint price) public 
                onlyManufacturer() 
                availableUPC(upc, quantity) { 

        for(uint8 i=0; i < quantity; i++) {
            uint id = upc+i;

            products[id].upc = id;
            products[id].price = price;
            products[id].productName = productName;
            products[id].item_state = default_state;
            products[id].item_history.push(history(msg.sender, block.timestamp));  
        }      
    }

    function buy_from_manufacturer(uint upc) public
                                             payable
                                             onlyRetailer()
                                             is_correct_state(upc, State.for_sale)
                                             paid_enough(products[upc].price){
        
        address payable owner_addr = payable(get_owner(upc));
        owner_addr.transfer(products[upc].price);

        products[upc].item_state = State.purchased; // update state
        add_history(upc, msg.sender, block.timestamp); // update owner
    }

    function ship_item (uint upc) public 
                                  is_correct_state(upc, State.purchased){
        require(msg.sender == get_prev_owner(upc), "Can be shipped only by the person who is holding it");

        products[upc].item_state = State.shipped;
    }

    function received_item(uint upc) public 
                                     is_product_owner(upc)
                                     is_correct_state(upc, State.shipped){
        products[upc].item_state = State.Received;
    }

    function sell_item(uint upc, uint price) 
                public
                is_product_owner(upc)
                is_correct_state(upc, State.Received) {
        
        products[upc].item_state = State.for_sale;
        products[upc].price = price;
    }

    function buy_product(uint upc) 
                public
                payable
                paid_enough(products[upc].price){

        address payable owner_addr = payable(get_owner(upc));
        owner_addr.transfer(products[upc].price);
        
        add_history(upc, msg.sender, block.timestamp); // update owner
        products[upc].item_state = State.purchased; // update state

    }

    function get_history(uint upc) public
                                   view
                                   returns(history[] memory){
        
        return products[upc].item_history;
    }

    function remove_product(uint upc) public onlyOwner() {
        require(bytes(products[upc].productName).length == 0, "This product does not exist");
        delete products[upc];
    }
}