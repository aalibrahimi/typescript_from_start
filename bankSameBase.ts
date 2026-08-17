/// <reference types="node" />
import readlineSync from "readline-sync";
const myPrompt = (q: string) => readlineSync.question(q);
import chalk from "chalk";
// const chalk = new Chalk({ level: 3 })
/**
 * Bank Account
 * Create a BankAccount class with a balance. Add methods to deposit, withdraw, and getBalance.
 * Withdrawing more than the balance should do nothing.
 */

import fs, { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url"; 

// wher does the data.json actually live? NEXT TO THIS FILE
const here = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(here, "data.json")

function loadData() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8"); // string
  // const raw = fs.readFileSync("./data.json", "utf-8"); // could now delete lines 17 and 18
  const jsonParsedData = JSON.parse(raw) as jsonAccountDataTypes  // object
  console.log(raw)
  return jsonParsedData
}

// GOAL: Read current value and add new values
// 1. Read data
// 2. Edit the retrieved data
// 3. Write entire new data to file

const jsonReturnedData = loadData()
// jsonReturnedData.accountData["chase"].accountBalance

type accountType = "debit" | "credit" | "savings";
// type transactionSource = "user" | "system"
type action = "deposit" | "withdraw" | "interest";
type transactionMethod = "atm" | "online" | "direct deposit";

interface transactionType {
  action: action;
  accountType: accountType;
  // source: transactionSource,
  method?: transactionMethod;
  amount: number;
  balanceAfter: number;
}

interface jsonAccountDataTypes {
  accountData: {
    [bankName: string]: {
      accountBalance: number,
      accountHolder: string,
      accountType: accountType,
      pin: string,
      creditLimit?: number,
      interest: number,
      lastInterestDate: string,
      transactionHistory: transactionType[]  
    }
  }
 
};

// let multipleBankCards: bankCard[] = [
//   {
//     name: "Chase",
//     balance: 550,
//     type: "debit",
//     creds: "Ali",
//     pin: 5621,
//   },
//   {
//     name: "Wells Fargo",
//     balance: 195,
//     type: "credit",
//     creds: "john",
//     pin: 2412,
//     creditLimit: 1000,
//   },
//   {
//     name: "capital one",
//     balance: 250,
//     type: "savings",
//     creds: "jane",
//     pin: 1234,
//   },
// ];


// LOGIN - OUTSIDE THE CLASS
console.log("BANK ACCOUNTS:\n");
for (const bankNames of Object.keys(jsonReturnedData.accountData)) {
  console.log(chalk.italic.underline(bankNames.toUpperCase()));
}

const inputBankName = myPrompt("\nSELECT ACCOUNT:\n\n").trim().toLowerCase();
const inputCreds = myPrompt("\nName on Account:\n").trim().toLowerCase();
const inputPin = (myPrompt("\nEnter Pin:\n"));

const chosenCard = Object.entries(jsonReturnedData.accountData).find(( [bankName, account] ) => {
  return (
   bankName.toLowerCase() === inputBankName &&
   account.accountHolder .toLowerCase() === inputCreds &&
   account.pin === inputPin
  );
});

// GUARD
if (!chosenCard) {
  console.log("Card not found, try again");
  process.exit();
}

// const foundCard = chosenCard[1]

class BankAccount {
  // private balance: number;
  // private accountType: accountType;
  // private creditLimit: number | undefined;
  // private transactions_history: transactionType[] = [];
  // private lastInterestDate: Date = new Date(); // setting it right now
  private bankName: string;
  private accountDetails: jsonAccountDataTypes["accountData"][0]

  constructor(bankName: string, accountDetails: jsonAccountDataTypes["accountData"][0]) {
    this.bankName = bankName,
    this.accountDetails = accountDetails
  }

  // constructor(balance: number, accountType: accountType, creditLimit?: number) {
  //   this.accountDetails.interest = balance;
  //   this.accountDetails.accountType = accountType;
  //   this.creditLimit = creditLimit;
  // }
  save() {
    // Step 1: Reading Existing Data
    const existingData = JSON.parse(readFileSync("./data.json", "utf-8")) as jsonAccountDataTypes
    // Step 2: Edit Data
    existingData.accountData[this.bankName] = this.accountDetails
    // Step 3: Writing to File
    writeFileSync("./data.json", JSON.stringify(existingData, undefined, 2))

  }
  withdraw(amount: number, methodInput: transactionMethod): void {
    if (this.accountDetails.accountType === "savings" || this.accountDetails.accountType === "debit") {
      if (amount > this.accountDetails.accountBalance) {
        let Insufficient = chalk.red("======= Insufficient funds. ========");
        console.log(Insufficient);
        return;
      }
    }
    if (this.accountDetails.accountType === "credit") {
      if (!this.accountDetails.creditLimit || this.accountDetails.accountBalance - amount < -this.accountDetails.creditLimit) {
        let limitExceeded = chalk.yellow("Credit limit exceeded.");
        console.log(limitExceeded);
        return;
      }
    }

    let newBalance = (this.accountDetails.accountBalance -= amount);
    this.accountDetails.transactionHistory.push({
      action: "withdraw",
      amount: amount,
      balanceAfter: newBalance,
      method: methodInput,
      accountType: this.accountDetails.accountType,
    });
    // saving withdrawal changes
    this.save()
    // console.log(chalk.green(`New Balance:+${this.accountDetails.accountBalance}`))
    console.log("New Balance: " + chalk.cyan(`$${this.accountDetails.accountBalance}`));
  }

  deposit(amount: number, methodInput: transactionMethod): void {
    let newBalance = (this.accountDetails.accountBalance += amount);
    this.accountDetails.transactionHistory.push({
      action: "deposit",
      method: methodInput,
      amount: amount,
      balanceAfter: newBalance,
      accountType: this.accountDetails.accountType,
    });
    // savings deposit
    this.save()
    console.log("New Balance: " + chalk.cyan(`$${this.accountDetails.accountBalance}`));
  }
  getBalance(): number {
    return this.accountDetails.accountBalance;
  }

  applyInterest() {
    // get current time and compare to when interest was last applied
    const now = new Date();
    const diffDays =
      (now.getTime() - new Date(this.accountDetails.lastInterestDate).getTime()) / (1000 * 60 * 60 * 24);

    // block interest if 30 days haven't passed yet
    if (diffDays < 30) {
      const daysLeft = Math.ceil(30 - diffDays);
      console.log(`${daysLeft} days until next interest cycle.`);
      return;
    }

    let interestAmount = 0;
    // savings: bank pays you 2% of your balance each month
    if (this.accountDetails.accountType === "savings") {
      const interest = this.accountDetails.interest * 0.02; // calculate 2% of current balance
      this.accountDetails.interest += interest; // add it on top (compounding)
      interestAmount = interest;
      console.log(
        `Interest earned: +$${interest.toFixed(2)}. New balance: $${this.accountDetails.interest.toFixed(2)}`,
      );
    }

    // credit: you get charged 20% on however much you owe (negative balance only)
    else if (this.accountDetails.accountType === "credit" && this.accountDetails.interest < 0) {
      const charge = this.accountDetails.interest * 0.2; // 20% of a negative number = negative result
      this.accountDetails.interest += charge; // adding a negative makes balance more negative (deeper in debt)
      interestAmount = Math.abs(charge);
      console.log(
        `Interest charged: -$${Math.abs(charge).toFixed(2)}. New balance: $${this.accountDetails.interest.toFixed(2)}`,
      );
    }

    // debit accounts earn nothing
    else {
      console.log("No interest applies to this account type.");
    }

    // reset the 30-day clock so interest won't apply again until next month
    this.accountDetails.lastInterestDate = new Date().toISOString();
    this.accountDetails.transactionHistory.push({
      action: "interest",
      amount: interestAmount,
      balanceAfter: this.accountDetails.interest,
      accountType: this.accountDetails.accountType,
    });
    // saving interest rates / dates
    this.save()
  }
  printStatement(): void {
    if (this.accountDetails.transactionHistory.length === 0) {
      console.log(chalk.blue(" There is no previous transactions "));
      return;
    }
    for (const transaction of this.accountDetails.transactionHistory) {
      console.log(
        `[${transaction.method}] ${transaction.action}: ${transaction.amount}`,
      );
      if (this.accountDetails.creditLimit) {
        console.log(chalk.bgCyanBright(`Credit limit: ${this.accountDetails.creditLimit}`));
      }
    }
  }
}

const bankAccount = new BankAccount(
  // foundCard.accountBalance,
  // foundCard.accountType,
  // foundCard.creditLimit,
  chosenCard[0],
  chosenCard[1], 
);

// let runScript = true;
let prompt = myPrompt(
  "\nWhat would you like to do?\n\n1. Deposit\n2. Withdraw\n3. Get Balance\n4. View Statement\n5. exist\n\n",
).trim();

while (prompt !== "exit" && Number(prompt) !== 5) {
  //   console.log("Selected Option: ", prompt);
  switch (prompt) {
    case "1": {
      let amount = myPrompt("How much would you like to deposit? $");
      const validateDepositMethod = ["atm", "online", "direct deposit"];
      let depositMethod = myPrompt(
        "DEPOSIT METHOD:\N (Atm\nOnline\ndirect deposit?)\n",
      )
        .toLowerCase()
        .trim();

      if (!validateDepositMethod.includes(depositMethod as transactionMethod)) {
        console.log("Invalid Method.");
        break;
      }
      bankAccount.deposit(Number(amount), depositMethod as transactionMethod);
      break;
    }
    case "2": {
      let amount = myPrompt("How much would you like to withdraw? $");
      const validWithdrawalMethod = ["atm", "online", "direct deposit"];
      let withdrawMethod = myPrompt(
        "WITHDRAW METHOD (\nAtm\nOnline\ndirect deposit?)\n",
      )
        .toLowerCase()
        .trim();

      if (
        !validWithdrawalMethod.includes(withdrawMethod as transactionMethod)
      ) {
        console.log("Not a valid method");
        break;
      }
      bankAccount.withdraw(Number(amount), withdrawMethod as transactionMethod);
      break;
    }
    case "3": {
      const balance = bankAccount.getBalance();
      console.log(
        `========= Current Balance: $${balance} ====================`,
      );
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
