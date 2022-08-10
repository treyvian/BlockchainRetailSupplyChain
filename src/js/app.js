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

function get_time(unix_time){
	var a = new Date(unix_time * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	return time;
}

function generate_table(result) {
	// creates a <table> element and a <tbody> element
	const tbl = document.createElement("table");
	tbl.setAttribute("id", "table_history");
	const tblBody = document.createElement("tbody");

	var len = result.length;

	// Setting header
	var row = document.createElement("tr");
	var cell = document.createElement("th");
	cell.setAttribute("style", "color: #808000")
	var cellText = document.createTextNode("Owner address");
	cell.appendChild(cellText);
	row.appendChild(cell);
	cell = document.createElement("th");
	cell.setAttribute("style", "color: #808000")
	cellText = document.createTextNode("Timestamp of the block");
	cell.appendChild(cellText);
	row.appendChild(cell);
	tblBody.appendChild(row);

	// Populating the table
	for (let i = 0; i < len; i++) {
		row = document.createElement("tr");

		for (let j = 0; j < 2; j++) {
			cell = document.createElement("td");
			if (j == 0)
				cellText = document.createTextNode(result[0].owner);
			else
				cellText = document.createTextNode(get_time(result[0].time));
			cell.appendChild(cellText);
			row.appendChild(cell);
		}

		// add the row to the end of the table body
		tblBody.appendChild(row);
	}

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
	deployedAddress: '0x7D28d3cD1f99c0527550C51A429b40B2Fc26f262',
	
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
			case 13:
				return await App.buy_client(event);
			case 14:
				return await App.ship_client(event);
			case 15:
				return await App.received_client(event);
			case 16:
				return await App.sell_client(event);
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
		var table_client = document.getElementById("client_products")
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
			table_client.innerHTML += t;

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

		// Remove previous table if it exist
		var tab = document.getElementById('table_history')
		if (tab){
			var parentEl = tab.parentElement;
			parentEl.removeChild(tab);
		}

		await App.contract.methods.get_history(upc)
							.call({from: accountsOnEnable[0]})
							.then((result) => {
			
			generate_table(result);
			
		}).catch((error) => {console.log(error)});

		document.getElementById('upc_hist').value = "";
	},

	buy_client: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("client_products")
		var upc = document.getElementById('UPC_buy_client').value;
		var rows = table.rows;
		var row = document.getElementById(upc);
		var name = row.cells[1].innerHTML;
		var price = row.cells[2].innerHTML;
		var index = get_row_index(rows, row);

		await App.contract.methods.buy_product(upc)
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

		document.getElementById('UPC_buy_client').value = "";
	},

	ship_client: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});
		var table = document.getElementById("client_products")
		var upc = document.getElementById('UPC_ship_client').value;
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
		
		document.getElementById('UPC_ship_client').value = "";
	},

	received_client: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table = document.getElementById("client_products");
		var upc = document.getElementById('UPC_receive_client').value;
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
	
	sell_client: async function(event) {
		event.preventDefault();
		var accountsOnEnable = await ethereum.request({method: 'eth_requestAccounts'});

		var table_client = document.getElementById("client_products")
		var upc = document.getElementById('UPC_sell_client').value;
		var price = document.getElementById('Price_sell_client').value;
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
			table_client.innerHTML += t;

		}).catch((error) => {console.log(error)});
		
		document.getElementById('UPC_sell_client').value = "";
		document.getElementById('Price_sell_client').value = "";
	},
};

$(function() {
$(window).load(function() {
	App.init();
});
});
