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

        uint price;
        address[] item_history;
    }

    // Define a public mapping 'items' that maps the UPC to an Item.
    mapping (uint => Item) products;


    modifier availableUPC(uint upc, uint8 quantity) {
        for(uint8 i=0; i<quantity; i++){
            require(bytes(products[upc+i].productName).length == 0);
        }
        _;
    }

    // Define a modifer that checks to see if msg.sender == owner of the contract
    modifier is_product_owner(uint upc) {
        require(msg.sender == get_owner(upc));
        _;
    }

    modifier is_correct_state(uint upc, State state){
        require(products[upc].item_state == state);
        _;
    }

    // Define a modifier that checks if the paid amount is sufficient to cover the price
    modifier paid_enough(uint _price) {
        require(msg.value >= _price);
        _;
    }

    function get_owner(uint upc) private view returns(address){
        uint len = products[upc].item_history.length;
        return products[upc].item_history[len - 1];
    }

    function get_prev_owner(uint upc) private view returns(address){
        uint len = products[upc].item_history.length;
        if (len > 1)
            return products[upc].item_history[len - 2];
        else
            return products[upc].item_history[len - 1];
    }

    function get_manufacturer(uint upc) private view returns(address){
            return products[upc].item_history[0];
    }

    function add_product(uint upc, string memory productName, uint8 quantity, uint price) public 
                onlyManufacturer() 
                availableUPC(upc, quantity) { 

        for(uint8 i=0; i < quantity; i++) {
            uint id = upc+1;
            Item memory new_item;
            new_item.upc = id;
            new_item.price = price;
            new_item.productName = productName;
            new_item.item_state = default_state;
            
            products[id] = new_item;
            //products[id].item_history.push(msg.sender);
        }      
    }

    function buy_from_manufacturer(uint upc) public
                                             payable
                                             onlyRetailer()
                                             paid_enough(products[upc].price){
                
        address payable owner_addr = payable(get_owner(upc));
        owner_addr.transfer(products[upc].price);

        products[upc].item_history.push(msg.sender); // update owner
        products[upc].item_state = State.purchased; // update state
    }

    function ship_item (uint upc) public 
                                  is_correct_state(upc, State.purchased){
        require(msg.sender == get_prev_owner(upc));

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

        products[upc].item_history.push(msg.sender); // update owner
        products[upc].item_state = State.purchased; // update state

    }

    function get_history(uint upc) public
                                   view
                                   returns(address[] memory){
        
        return products[upc].item_history;
    }

    function remove_product(uint upc) public onlyOwner() {
        require(bytes(products[upc].productName).length == 0);
        delete products[upc];
    }
}