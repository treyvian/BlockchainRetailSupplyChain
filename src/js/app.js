function get_row_index(rows, row) {
	var index = -1;
	for (var i=0;i<rows.length; i++){
		if ( rows[i] == row ){
			index = i;
			break;
		}
	}
	return index;
}

function generate_table(len) {
	// creates a <table> element and a <tbody> element
	const tbl = document.createElement("table");
	const tblBody = document.createElement("tbody");

	const row = document.createElement("tr");

	for (let j = 0; j < len; j++) {
		// Create a <td> element and a text node, make the text
		// node the contents of the <td>, and put the <td> at
		// the end of the table row
		const cell = document.createElement("td");
		const cellText = document.createTextNode(`column ${j}`);
		cell.appendChild(cellText);
		row.appendChild(cell);
	}

	// add the row to the end of the table body
	tblBody.appendChild(row);

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);
	// appends <table> into <body>
	document.body.appendChild(tbl);
	// sets the border attribute of tbl to '2'
	tbl.setAttribute("border", "2");
}

App = {
	web3Provider: null,
	contract: null,
	deployedAddress: '0x5e40c3784467A0cFed66cB4Da8F90a79Dc51b68e',
	
	manufacturerAccount: null,
	retailerAccount: null,

	init: async function() {
		return await App.initWeb3();
	},

	initWeb3: async function() {

		// Modern dapp browsers...
		if (window.ethereum) {
			App.web3Provider = window.ethereum;
			try {
				// Request account access
				await window.ethereum.enable();
			} catch (error) {
				// User denied account access...
				console.error("User denied account access")
			}
		}
		// Legacy dapp browsers...
		else if (window.web3) {
			App.web3Provider = window.web3.currentProvider;
		}
		// If no injected web3 instance is detected, fall back to Localhost
		else {
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
		}

		return App.initContract();
	},

	initContract: function() {
		web3 = new Web3(App.web3Provider);

		// Get the deployed contract instance
		var contract = new web3.eth.Contract(abi, App.deployedAddress);

		App.contract = contract;
		console.log(App.contract)

		// Set the provider for our contract
		App.contract.setProvider(App.web3Provider);

		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click', App.handleButtonClick);	
	},

	handleButtonClick: async function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        switch(processId) {
            case 1:
                return await App.addManufacturer(event);
            case 2:
                return await App.addRetailer(event);
			case 3:
				return await App.product_added(event);
            case 4:
                return await App.purchased_by_retailer(event);
            case 5:
                return await App.shipped(event);
            case 6:
                return await App.received(event);
			case 7:
				return await App.for_sale(event);
			case 8:
				return await App.purchased(event);
			case 9:
				return await App.removed(event);
			case 10:
				return await App.removeManufacturer(event);
			case 11:
				return await App.removeRetailer(event);
			case 12:
				return await App.get_hist(event);
        }
    },

	addManufacturer: async function(event) {
        event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
        var resultTag = document.getElementById("manufacturerID").value;
		
		await App.contract.methods.isManufacturer(resultTag).call()
															.then(async (result) => {
			console.log("Manufacturer ?: ", result)

			if (!result){
				await App.contract.methods.addManufacturer(resultTag).send({ from: accountsOnEnable[0]}).then((result) => {
					alert ('adding Address to the role: Manufacturer');
				}).catch((error) => {console.log(error)});
			} else {
				console.log('Already a Manufacturer')
				alert ('This address is already a Manufacturer');
				return
			}

		}).catch((error) => {console.log(error)});

		document.getElementById("manufacturerID").value = "";
    },

	addRetailer: async function(event) {
        event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
        var resultTag = document.getElementById("retailerID").value;

		await App.contract.methods.isRetailer(resultTag).call().then((result) => {

			console.log("Retailer ?: ", result)

			if (!result){
				App.contract.methods.addRetailer(resultTag)
									.send({from: accountsOnEnable[0]})
									.then((result) => {
					alert ('adding Address to the role: Retailer');
				}).catch((error) => {console.log(error)});
			} else {
				console.log('Already a Retailer')
				alert ('This address is already a Retailer');
				return
			}

		}).catch((error) => {console.log(error)});

		document.getElementById("retailerID").value = "";
    },

	removeManufacturer: async function(event) {
        event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
        var resultTag = document.getElementById("remmanufacturerID").value;
		
		await App.contract.methods.isManufacturer(resultTag).call()
															.then((result) => {
			console.log("Manufacturer ?: ", result)

			if (!result){
				alert ('This Address is not a Manufacturer');
			} else {
				App.contract.methods.renounceManufacturer(resultTag)
									.send({ from: accountsOnEnable[0]})
									.catch((error) => {console.log(error)});
			}

		}).catch((error) => {console.log(error)});

		document.getElementById("remmanufacturerID").value = "";
    },

	removeRetailer: async function(event) {
        event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
        var resultTag = document.getElementById("remretailerID").value;

		await App.contract.methods.isRetailer(resultTag).call().then((result) => {

			console.log("Retailer ?: ", result)

			if (!result){
				alert ('This Address is not a Retailer');
			} else {
				App.contract.methods.renounceRetailer(resultTag)
									.send({ from: accountsOnEnable[0]})
									.catch((error) => {console.log(error)});
			}

		}).catch((error) => {console.log(error)});

		document.getElementById("remretailerID").value = "";
    },

	product_added: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
		var upc = document.getElementById('UPC').value;
		var name = document.getElementById('name').value;
		var qty = document.getElementById('qty').value;
		var price = document.getElementById('price').value;

		await App.contract.methods.add_product(upc,name,qty,price)
							.send({from: accountsOnEnable[0]})
							.then((result) => {

			for (var i=0; i<parseInt(qty); i++){
				id = (parseInt(upc) + i)
				var t = "";
				var tr = "<tr id=\""+id+"\">";
				tr += "<td>"+id+"</td>";
				tr += "<td>"+name+"</td>";
				tr += "<td>"+price+"</td>";
				tr += "<td>"+"Manufacturer"+"</td>";
				tr += "<td>"+accountsOnEnable[0]+"</td>";
				tr += "<td>"+"For sale"+"</td>";
				tr += "</tr>";
				t += tr;
				document.getElementById("posts").innerHTML += t;
			} 

		}).catch((error) => {console.log(error)});

		document.getElementById('UPC').value = "";
		document.getElementById('name').value = "";
		document.getElementById('qty').value = "";
		document.getElementById('price').value = "";
	},

	purchased_by_retailer: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("posts")
		var upc = document.getElementById('UPC_buy').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var name = row.cells[1].innerHTML;
		var price = row.cells[2].innerHTML;
		var index = get_row_index(rows, row);

		await App.contract.methods.buy_from_manufacturer(upc)
							.send({from: accountsOnEnable[0]})
							.then((result) => {

			table.deleteRow(index);

			var t = "";
			var tr = "<tr id=\""+upc+"\">";
			tr += "<td>"+upc+"</td>";
			tr += "<td>"+name+"</td>";
			tr += "<td>"+price+"</td>";
			tr += "<td>"+"Retailer"+"</td>";
			tr += "<td>"+accountsOnEnable[0]+"</td>";
			tr += "<td>"+"Bought"+"</td>";
			tr += "</tr>";
			t += tr;
			table.innerHTML += t;

		}).catch((error) => {console.log(error)});

		document.getElementById('UPC_buy').value = "";
	},

	shipped: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
		var table = document.getElementById("posts")
		var upc = document.getElementById('UPC_ship').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var name = row.cells[1].innerHTML;
		var price = row.cells[2].innerHTML;
		var index = get_row_index(rows, row);
		

		await App.contract.methods.ship_item(upc)
							.send({from: accountsOnEnable[0]})
							.then((result) => {
					
			table.deleteRow(index);

			var t = "";
			var tr = "<tr id=\""+upc+"\">";
			tr += "<td>"+upc+"</td>";
			tr += "<td>"+name+"</td>";
			tr += "<td>"+price+"</td>";
			tr += "<td>"+"Retailer"+"</td>";
			tr += "<td>"+accountsOnEnable[0]+"</td>";
			tr += "<td>"+"Shipped"+"</td>";
			tr += "</tr>";
			t += tr;
			table.innerHTML += t;

		}).catch((error) => {console.log(error)});
		
		document.getElementById('UPC_ship').value = "";
	},

	received: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("posts")
		var upc = document.getElementById('UPC_ship').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var name = row.cells[1].innerHTML;
		var price = row.cells[2].innerHTML;
		var index = get_row_index(rows, row);
		

		await App.contract.methods.received_item(upc)
							.send({from: accountsOnEnable[0]})
							.then((result) => {

			table.deleteRow(index);

			var t = "";
			var tr = "<tr id=\""+upc+"\">";
			tr += "<td>"+upc+"</td>";
			tr += "<td>"+name+"</td>";
			tr += "<td>"+price+"</td>";
			tr += "<td>"+"Retailer"+"</td>";
			tr += "<td>"+accountsOnEnable[0]+"</td>";
			tr += "<td>"+"Received"+"</td>";
			tr += "</tr>";
			t += tr;
			table.innerHTML += t;

		}).catch((error) => {console.log(error)});
		
		document.getElementById('UPC_ship').value = "";
	},

	received: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("posts");
		var upc = document.getElementById('UPC_receive').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var name = row.cells[1].innerHTML;
		var price = row.cells[2].innerHTML;
		var index = get_row_index(rows, row);
		

		await App.contract.methods.received_item(upc)
							.send({from: accountsOnEnable[0]})
							.then((result) => {

			table.deleteRow(index);

			var t = "";
			var tr = "<tr id=\""+upc+"\">";
			tr += "<td>"+upc+"</td>";
			tr += "<td>"+name+"</td>";
			tr += "<td>"+price+"</td>";
			tr += "<td>"+"Retailer"+"</td>";
			tr += "<td>"+accountsOnEnable[0]+"</td>";
			tr += "<td>"+"Received"+"</td>";
			tr += "</tr>";
			t += tr;
			table.innerHTML += t;
		
		}).catch((error) => {console.log(error)});

		document.getElementById('UPC_receive').value = "";
	},
	
	for_sale: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("posts");
		var upc = document.getElementById('UPC_sell').value;
		var price = document.getElementById('Price_sell').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var name = row.cells[1].innerHTML;
		var index = get_row_index(rows, row);
		

		await App.contract.methods.sell_item(upc, price)
							.send({from: accountsOnEnable[0]})
							.then((result) => {

			table.deleteRow(index);

			var t = "";
			var tr = "<tr id=\""+upc+"\">";
			tr += "<td>"+upc+"</td>";
			tr += "<td>"+name+"</td>";
			tr += "<td>"+price+"</td>";
			tr += "<td>"+"Retailer"+"</td>";
			tr += "<td>"+accountsOnEnable[0]+"</td>";
			tr += "<td>"+"for sale"+"</td>";
			tr += "</tr>";
			t += tr;
			table.innerHTML += t;

		}).catch((error) => {console.log(error)});
		
		document.getElementById('UPC_sell').value = "";
		document.getElementById('Price_sell').value = "";
	},

	removed: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("posts");
		var upc = document.getElementById('UPC_remove').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var index = get_row_index(rows, row);
		

		await App.contract.methods.remove_product(upc)
							.send({from: accountsOnEnable[0]})
							.then((result) => {

			if (index != -1){
				table.deleteRow(index);
			} else {
				alert ("Product not found!")
			}
		}).catch((error) => {console.log(error)});

		document.getElementById('UPC_remove').value = "";
	},

	get_hist: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var upc = document.getElementById('upc_hist').value;

		await App.contract.methods.get_history(upc)
							.call({from: accountsOnEnable[0]})
							.then((result) => {
			
			var len = result.length;
			console.log(result)
			generate_table(len);
			
		}).catch((error) => {console.log(error)});

		document.getElementById('upc_hist').value = "";
	},
};

$(function() {
$(window).load(function() {
	App.init();
});
});
