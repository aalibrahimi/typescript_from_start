import readlineSync from "readline-sync";
const myPrompt = (q: string) => readlineSync.question(q);
import chalk from "chalk"
// const chalk = new Chalk({ level: 3 })
/**
 * Bank Account
 * Create a BankAccount class with a balance. Add methods to deposit, withdraw, and getBalance.
 * Withdrawing more than the balance should do nothing.
 */

type accountType = "debit" | "credit" | "savings"
// type transactionSource = "user" | "system"
type action = "deposit" | "withdraw" | "interest"
type transactionMethod = "atm" | "online" | "direct deposit"

interface transactionType {
    action: action,
    accountType: accountType,
    // source: transactionSource,
    method?: transactionMethod,
    amount: number,
    balanceAfter: number,
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
        type: "savings",
        creds: "jane",
        pin: 1234,
        
        
    }
    
]

// LOGIN - OUTSIDE THE CLASS
console.log("BANK ACCOUNTS:\n")
 for ( const bankNames of multipleBankCards ) {
    
    console.log(chalk.italic.underline(bankNames.name.toUpperCase()))
 }

 const inputBankName = myPrompt("\nSELECT ACCOUNT:\n\n").trim().toLowerCase()
 const inputCreds = myPrompt("\nName on Account:\n").trim().toLowerCase()
 const inputPin = Number(myPrompt("\nEnter Pin:\n"))

 const foundCard = 
    multipleBankCards.find(( card ) => {
        return card.name.toLowerCase() === inputBankName && card.creds.toLowerCase() === inputCreds && card.pin === inputPin
    })

 
// GUARD
if (!foundCard) {
   console.log("Card not found, try again")
   process.exit()
}

class BankAccount {
 private balance: number;
 private accountType: accountType;
 private creditLimit: number | undefined;
 private transactions_history: transactionType[] = []
 private lastInterestDate: Date = new Date(); // setting it right now


  constructor(balance: number, accountType: accountType, creditLimit?: number, ) {
    this.balance = balance;
    this.accountType = accountType;
    this.creditLimit = creditLimit;
  }

  withdraw(amount: number, methodInput: transactionMethod): void {
    if (this.accountType === "savings" || this.accountType === "debit") {
        if (amount > this.balance) {
            let Insufficient = chalk.red("======= Insufficient funds. ========")
            console.log(Insufficient);
            return
        }
    }
    if (this.accountType === "credit") {
        if (!this.creditLimit || this.balance - amount < -this.creditLimit) {
            let limitExceeded = chalk.yellow("Credit limit exceeded.")
            console.log(limitExceeded)
            return
        }

      
    }
  
    let newBalance = this.balance -= amount
    this.transactions_history.push({ action: "withdraw", amount: amount, balanceAfter: newBalance, method: methodInput , accountType: this.accountType })
    // console.log(chalk.green(`New Balance:+${this.balance}`))
    console.log("New Balance: " + chalk.cyan(`$${this.balance}`))
  }

  deposit(amount: number, methodInput: transactionMethod): void {
    let newBalance = this.balance += amount;
    this.transactions_history.push({ action: "deposit", method: methodInput, amount: amount, balanceAfter: newBalance , accountType: this.accountType})
    console.log("New Balance: " + chalk.cyan(`$${this.balance}`));
  }
  getBalance(): number {
    return this.balance;
  }

  applyInterest() {
    // get current time and compare to when interest was last applied
    const now = new Date()
    const diffDays = (now.getTime() - this.lastInterestDate.getTime()) / (1000 * 60 * 60 * 24)

    // block interest if 30 days haven't passed yet
    if (diffDays < 30) {
        const daysLeft = Math.ceil(30 - diffDays)
        console.log(`${daysLeft} days until next interest cycle.`)
        return
    }

    let interestAmount = 0;
    // savings: bank pays you 2% of your balance each month
    if (this.accountType === "savings") {
        const interest = this.balance * 0.02   // calculate 2% of current balance
        this.balance += interest               // add it on top (compounding)
        interestAmount = interest
        console.log(`Interest earned: +$${interest.toFixed(2)}. New balance: $${this.balance.toFixed(2)}`)
    }

    // credit: you get charged 20% on however much you owe (negative balance only)
    else if (this.accountType === "credit" && this.balance < 0) {
        const charge = this.balance * 0.20     // 20% of a negative number = negative result
        this.balance += charge                 // adding a negative makes balance more negative (deeper in debt)
        interestAmount = Math.abs(charge)
        console.log(`Interest charged: -$${Math.abs(charge).toFixed(2)}. New balance: $${this.balance.toFixed(2)}`)
    }

    // debit accounts earn nothing
    else {
        console.log("No interest applies to this account type.")
    }

    // reset the 30-day clock so interest won't apply again until next month
    this.lastInterestDate = new Date()
    this.transactions_history.push({ action: "interest", amount: interestAmount, balanceAfter: this.balance, accountType: this.accountType })
  }
  printStatement(): void {
    if ( this.transactions_history.length === 0 ) {
        console.log(chalk.blue(" There is no previous transactions "))
        return
    }
    for ( const transaction of this.transactions_history) {
        console.log(`[${transaction.method}] ${transaction.action}: ${transaction.amount}`)
        if (this.creditLimit) {
            console.log(chalk.bgCyanBright(`Credit limit: ${this.creditLimit}`))
        }
    }
  }
}

const bankAccount = new BankAccount(foundCard!.balance, foundCard!.type, foundCard!.creditLimit);

// let runScript = true;
let prompt = myPrompt(
    "\nWhat would you like to do?\n\n1. Deposit\n2. Withdraw\n3. Get Balance\n4. View Statement\n5. exist\n\n",
  ).trim();


while ( prompt !== "exit" && Number(prompt) !== 5) {
  
//   console.log("Selected Option: ", prompt);
  switch (prompt) {
    case "1": {
      let amount = myPrompt("How much would you like to deposit? $");
      const validateDepositMethod = ["atm", "online", "direct deposit"]
      let depositMethod = myPrompt("DEPOSIT METHOD:\N (Atm\nOnline\ndirect deposit?)\n").toLowerCase().trim()

      if(!validateDepositMethod.includes(depositMethod as transactionMethod)) {
        console.log("Invalid Method.")
        break
      }
      bankAccount.deposit(Number(amount), depositMethod as transactionMethod);
      break;
    }
    case "2": {
      let amount = myPrompt("How much would you like to withdraw? $") ;
      const validWithdrawalMethod = ["atm", "online", "direct deposit"]
      let withdrawMethod = myPrompt("WITHDRAW METHOD (\nAtm\nOnline\ndirect deposit?)\n").toLowerCase().trim()
     
      if(!validWithdrawalMethod.includes(withdrawMethod as transactionMethod)) {
        console.log("Not a valid method");
        break;
      }
      bankAccount.withdraw(Number(amount), withdrawMethod as transactionMethod);
      break;
    }
    case "3": {
      const balance = bankAccount.getBalance();
      console.log(`========= Current Balance: $${balance} ====================`);
      break;
    }
    case "4": {
        bankAccount.printStatement();
        break;
    }
    default:
      console.log(chalk.italic("Please enter a valid option."));
  }

  prompt = myPrompt(
    "\n\n1. Deposit\n2. Withdraw\n3. Get Balance\n4. View Statement\n5. exist\n 6.Return to main menu\n",
  ).trim();
}


