//Bamazon project for Vanderbilt Software Coding Bootcamp.

var inquirer = require('inquirer');
var mysql = require('mysql');


var connection = mysql.createConnection({

    host: "localhost",
    port: 3306,

    user: "root",
    password: "password",
    database: "bamazon"
});



connection.connect(function (err) {
    if (err) throw err;

    start();
})


//This is the main function of the program.  It takes the user's input through inquirer prompts and performs SQL
//queries on the database.

function start() {

    connection.query("SELECT * FROM products", function (err, results) {


        //Inquirer prompts
        inquirer
            .prompt([
                {
                    name: "productID",
                    type: "list",
                    message: "Please enter the product ID for product you wish to purchase.",
                    choices: function () {
                        var productListing = [];
                        for (var i = 0; i < results.length; i++) {

                            productListing.push(results[i].item_id + " " + results[i].product_name);
                        }
                        return productListing;
                    }
                },

                {
                    name: "amount",
                    type: "input",
                    message: "Please enter the amount of items you wish to purchase.",
                    validate: function (value) {
                        if (isNaN(value) === false && value > 0) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {

                var splitArray = answer.productID.split(" ");
                var itemID = splitArray.splice(0, splitArray.length - 1);
                var inventoryAmount = 0;
                var customerCost = 0;

                //For loop to obtain the inventory amount and set the customer's cost for the item selected.
                for (var i = 0; i < results.length; i++) {

                    if (itemID[0] == results[i].item_id) {

                        inventoryAmount = results[i].stock_quantity;
                        customerCost = results[i].price * answer.amount;

                    }
                }

                //If the user ordered more than is available the app will inform them via console log and recursively
                //call this function.
                if (inventoryAmount < answer.amount) {

                    console.log("Only " + inventoryAmount + " of this product is available.  Please try again or select another product.\n");
                    start();
                }

                //If the order amount is less than the total the app will allow the user to make the purchase and will display
                //their total cost and recursively call this function.
                else {

                    var newInventory = inventoryAmount - answer.amount;

                    console.log("Your total cost is $" + customerCost + ".  Thanks for your purchase!");

                    connection.query("UPDATE products SET ? WHERE ?",

                        [
                            {
                                stock_quantity: newInventory
                            },

                            {
                                item_id: itemID[0]
                            }
                        ]);
                        
                        console.log("");
                        start();
                }

            })

    })
}

