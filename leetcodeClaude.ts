// const BankAccount = {
//     name: "Wells Fargo",
//     balance: 950.25,
//     card: "Debit",
//     userName: "Ali"
// } 

import PromptSync from "prompt-sync";

// firstly we defined the object with bank name, user, balance, and type of card
// now we need to add a condition where the user is able to select options, but to be able to do that, we need to be able to seperate
// functionalities from the object. does that mean we need a map?

// mapping is only for arrays, not for objects
// BankAccount.map( action => {

// })

// THE RIGHT PLAY HERE IS TO USE CLASS TO SEPERATE FUNCTIONALITIES
// Plain object — just data, no reusable structure


// Class — a blueprint you can create instances from, with built-in methods
class BankAccount {
    balance: number

    // now need a paramater for balance and assigning it to balance
    constructor(initialBalance: number) {
        this.balance = initialBalance
    }

    deposit(amount: number ) {
        this.balance += amount; // Add this to the balance
    }

    getBalance() {
       return this.balance;
    }

    withdraw(amount: number) {
        if ( this.balance > amount ) {
            this.balance -= amount;
        }
    }
}

const prompt = PromptSync({ sigint: true })

// this is to let users be able to control their own balance
// const input = prompt("Enter Balanace Amount: ")
// const amountUserBalance: number = parseFloat(input)


// const myAccount = new BankAccount(amountUserBalance)
const myAccount = new BankAccount(520.22)

let actionToTake = prompt("What do you want to do today with your account sir.\n 1. Check balance\n  2. desposit\n  3. withdraw\n  4. exit\n").trim()
while ( actionToTake !== "4") {
     
    if ( actionToTake === "1" || actionToTake === "check balance") {
       console.log( myAccount.balance)
    }
    
    else if ( actionToTake === "2" || actionToTake === "deposit") {
        const despositPrompt = prompt("Enter amount to desposit: ")
        const despositAmount = parseFloat(despositPrompt);
        myAccount.deposit(despositAmount)
        console.log(`New balance : ${ myAccount.balance }`)
        
    }
    
    else if ( actionToTake === "3" || actionToTake === "withdraw") {     
        const withdrawPrompt = prompt("Enter amount to withdraw: ")
        const withdrawAmount = parseFloat(withdrawPrompt);
        myAccount.withdraw(withdrawAmount);
        console.log(myAccount.balance)
        
    }
    
    else if ( actionToTake === "4" || actionToTake === "break") {
        break;
    }
    
    else {
        console.log("Wrong input sir... ")
    }
actionToTake = prompt("What do you want to do today with your account sir.\n 1. Check balance\n  2. desposit\n  3. withdraw\n  4. exit\n").trim()
}
console.log(myAccount.balance)
