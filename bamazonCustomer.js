//Define the necessary node packages
//===================================================
var mysql = require('mysql');
var inquirer = require('inquirer');
//Create connection to the bamazom database
//==================================================
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Bootcamp!2#",
  database: "bamazon"
})

// Execute the transation
function execute(){
//Pring all items for sale with details
connection.query('SELECT * FROM Products', function(err, res){
  if(err) throw err;

  console.log('Welcome to Bamazon')
  console.log('Here is our current inventory of ski gear')
  console.log('----------------------------------------------------------------------------------------------')

  for(var i = 0; i<res.length;i++){
    console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "QTY: " + res[i].StockQuantity);
    console.log('---------------------------------------------------------------------------------------------')
  }

  console.log(' ');
  inquirer.prompt([
    {
      type: "input",
      name: "id",
      message: "What is the ID of the product you would like to buy?",
      validate: function(value){
        if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0){
          return true;
        } else{
          return false;
        }
      }
    },
    {
      type: "input",
      name: "qty",
      message: "How many items would you like to buy?",
      validate: function(value){
        if(isNaN(value)){
          return false;
        } else{
          return true;
        }
      }
    }
    ]).then(function(answer){
      var whatToBuy = (answer.id)-1;
      var howMuchToBuy = parseInt(answer.qty);
      var grandTotal = parseFloat(((res[whatToBuy].Price)*howMuchToBuy).toFixed(2));

      //check if quantity is sufficient
      if(res[whatToBuy].StockQuantity >= howMuchToBuy){
        //after purchase, updates quantity in Products
        connection.query("UPDATE Products SET ? WHERE ?", [
        {StockQuantity: (res[whatToBuy].StockQuantity - howMuchToBuy)},
        {ItemID: answer.id}
        ], function(err, result){
            if(err) throw err;
            console.log("Your total is $" + grandTotal.toFixed(2) + " Thank you for your business.");
        });

        connection.query("SELECT * FROM Departments", function(err, deptRes){
          if(err) throw err;
          var index;
          for(var i = 0; i < deptRes.length; i++){
            if(deptRes[i].DepartmentName === res[whatToBuy].DepartmentName){
              index = i;
            }
          }
          
          //updates totalSales in departments table
          connection.query("UPDATE Departments SET ? WHERE ?", [
          {TotalSales: deptRes[index].TotalSales + grandTotal},
          {DepartmentName: res[whatToBuy].DepartmentName}
          ], function(err, deptRes){
              if(err) throw err;
          });
        });

      } else{
        console.log("Sorry, there are not enough items in stock.");
      }

      reprompt();
    })
})
}

//asks if they would like to purchase another item
 function reprompt(){
   inquirer.prompt([{
     type: "confirm",
     name: "reply",
     message: "Would you like to purchase another item?"
   }]).then(function(answer){
     if(answer.reply){
      execute();
    } else{
     console.log("Thank you for  your business.");
    }
 });
}

execute();