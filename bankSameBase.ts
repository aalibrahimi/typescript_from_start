import readlineSync from "readline-sync";
const myPrompt = (q: string) => readlineSync.question(q);
/**
 * Bank Account
 * Create a BankAccount class with a balance. Add methods to deposit, withdraw, and getBalance.
 * Withdrawing more than the balance should do nothing.
 */

type accountType = "debit" | "credit"
type action = "deposit" | "withdraw"

interface transactionType {
    action: action,
    accountType: accountType,
    amount: number,
}

type bankCard = {
    name: string,
    balance: number,
    type: accountType,
    creds: string,
    pin: number,  
    creditLimit?: number
}

let multipleBankCards: bankCard[] = [
    {
        name: "Chase",
        balance: 550,
        type: "debit",
        creds: "Ali",
        pin: 5621
    },
    {
        name: "Wells Fargo",
        balance: 195,
        type: "credit",
        creds: "john",
        pin: 2412,
        creditLimit: 1000,
    },
    {
        name: "capital one",
        balance: 250,
        type: "credit",
        creds: "jane",
        pin: 1234,
        creditLimit: 890,
        
    }
    
]

// LOGIN - OUTSIDE THE CLASS

 const inputCreds = myPrompt("What is the credentials for this card?")
 const inputPin = Number(myPrompt("What is the pin for this card?"))

 const foundCard = 
    multipleBankCards.find(( card ) => {
        return card.creds === inputCreds && card.pin === inputPin
    })
 
// GUARD
if (!foundCard) {
   console.log( "Card not found, try again" )
   process.exit()
}

class BankAccount {
 private balance: number;
 private accountType: accountType;
 private creditLimit: number | undefined;
 private transactions_history: transactionType[] = []


  constructor(balance: number, accountType: accountType, creditLimit?: number) {
    this.balance = balance;
    this.accountType = accountType;
    this.creditLimit = creditLimit;
  }

  withdraw(amount: number): void {
    if (this.accountType === "debit") {
        if (amount > this.balance) {
            console.log("Insufficient funds.")
            return
        }
    }
    if (this.accountType === "credit") {
        if (!this.creditLimit || this.balance - amount < -this.creditLimit) {
            console.log("Credit limit exceeded.")
            return
        }
    }
    this.balance -= amount
    this.transactions_history.push({ action: "withdraw", amount, accountType: this.accountType })
    console.log(`New Balance: ${this.balance}`)
  }
  deposit(amount: number): void {
    this.balance += amount;
    this.transactions_history.push({ action: "deposit", amount, accountType: this.accountType})
    console.log(`New Balance: ${this.balance}`);
  }
  getBalance(): number {
    return this.balance;
  }

  printStatement(): void {
    if ( this.transactions_history.length === 0 ) {
        console.log(" There is no previous transactions ")
        return
    }
    for ( const transaction of this.transactions_history) {
        console.log(`${transaction.action}: ${transaction.amount}`)
        if (this.creditLimit) {
            console.log(`Credit limit: ${this.creditLimit}`)
        }
    }
  }
}

const bankAccount = new BankAccount(foundCard!.balance, foundCard!.type, foundCard!.creditLimit);

let runScript = true;

while (runScript) {
  let prompt = myPrompt(
    "\nWhat would you like to do?\n\n1. Deposit\n2. Withdraw\n3. Get Balance\n4. View Statement\n5. exist\n\n",
  ).trim();

  console.log("Selected Option: ", prompt);
  switch (prompt) {
    case "1": {
      let amount = myPrompt("How much would you like to deposit? ");
      bankAccount.deposit(Number(amount));
      break;
    }
    case "2": {
      let amount = myPrompt("How much would you like to withdraw? ");
      bankAccount.withdraw(Number(amount));
      break;
    }
    case "3": {
      const balance = bankAccount.getBalance();
      console.log(`Current Balance: ${balance}`);
      break;
    }
    case "4": {
        bankAccount.printStatement();
        break;
    }
    case "5": {
        runScript = false;
        break
    }
    default:
      console.log("Please enter a valid option.");
      runScript = false;
      continue;
  }
}