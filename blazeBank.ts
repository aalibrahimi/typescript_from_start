import PromptSync from "prompt-sync";
import chalk from "chalk";

const myPrompt = PromptSync({ sigint: true });

type BankAccountType = "debit" | "credit" | "savings";
type TransactionType = "deposit" | "withdrawal";

interface Transaction {
  entry_type: TransactionType;
  amount: string;
}

interface BankAccountCreationOptions {
  balance: number;
  transaction_history: Transaction[];
  credit_limit: number;
  used_credit: number;
}

/**
 * Bank Account
 * Create a BankAccount class with a balance. Add methods to deposit, withdraw, and getBalance.
 * Withdrawing more than the balance should do nothing.
 */
class BankAccount {
  public account_name: string;
  private pin: number;
  private is_unlocked: boolean;
  private account_type: BankAccountType;
  private credit_limit: number | null;
  private used_credit: number;
  private balance: number;
  private days_passed: number;
  private transaction_history: Transaction[];

  constructor(
    account_name: string,
    account_type: BankAccountType,
    pin: number,
    options: Partial<BankAccountCreationOptions> = {},
  ) {
    const defaultOptions: BankAccountCreationOptions = {
      balance: 0,
      transaction_history: [],
      credit_limit: 0,
      used_credit: 0,
      ...options, // Put spread at the bottom so it overrides the defaults on top
    };
    this.account_name = account_name;
    this.pin = pin;
    this.is_unlocked = false;
    this.balance = defaultOptions.balance;
    this.transaction_history = defaultOptions.transaction_history;
    this.account_type = account_type;
    this.credit_limit =
      account_type === "debit" ? null : defaultOptions.credit_limit;
    this.used_credit = defaultOptions.used_credit;
    this.days_passed = 0;
  }

  /**
   * Handles security checks and account validation protocols.
   *
   * @returns boolean. `true` is all checks pass, `false` otherwise.
   */
  handleAccountSecurity(): boolean {
    // Pin Check
    if (this.is_unlocked) return true;
    const pin = Number(myPrompt("Enter pin code for account: "));
    if (pin !== this.pin) {
      console.log(chalk.red("Incorrect Pin!"));
      return false;
    }

    this.is_unlocked = true;

    // Account Type Validation
    if (
      this.account_type === "credit" &&
      (!this.credit_limit || this.credit_limit === 0)
    ) {
      console.log(
        chalk.red("Invalid Account creation.") +
          "Credit Cards must have a credit limit greater than 0!",
      );
      return false;
    }

    return true;
  }

  withdraw(amount: number): void {
    if (this.account_type === "debit" && amount > this.balance) return;
    // Debit: Check if new balance would exceed go negative before proceeding
    if (this.account_type === "debit") {
      const newBalance = this.balance - amount;
      if (newBalance < 0) {
        console.log(
          chalk.red("Cannot withdraw that amount.") +
            "Account cannot go negative!",
        );
        return;
      }
    }
    // Credit: Check if new balance would exceed Credit Limit before proceeding
    if (this.account_type === "credit" && this.credit_limit) {
      // *Remove negative by multiplying by -1 for easier comparison
      const newBalance = (this.balance - amount) * -1;
      if (newBalance > this.credit_limit) {
        console.log(
          chalk.red("Cannot withdraw that amount.") +
            "New Balance would surpass Credit Limit!",
        );
        return;
      }

      if (this.used_credit + amount > this.credit_limit) {
        console.log(
          chalk.red(
            "Cannot withdraw that amount. This would surpass Credit Limit!",
          ),
        );
        return;
      }

      this.used_credit += amount;
    }

    this.balance -= amount;
    const entry: Transaction = {
      entry_type: "withdrawal",
      amount: `-$${amount}`,
    };
    this.transaction_history.push(entry);
    console.log(`New Balance: ${this.getBalance()}`);
  }

  deposit(amount: number): void {
    this.balance += amount;
    // Is this the case IRL as well?
    // if (this.account_type === "credit" && this.used_credit > 0) {
    //   this.used_credit = Math.max(0, this.used_credit - amount);
    // }
    const entry: Transaction = { entry_type: "deposit", amount: `+$${amount}` };
    this.transaction_history.push(entry);
    console.log(`New Balance: ${this.getBalance()}`);
  }

  /**Apply Interest on a `monthly` basis */
  applyInterest() {
    console.log(chalk.italic.gray("Start of new month..."));
    // Savings Interest: 2%
    if (this.account_type === "savings") {
      this.balance += this.balance * 0.02;
    }

    // Credit Card Interest: 20%
    if (this.account_type === "credit" && this.balance < 0) {
      this.balance -= this.balance * 0.2;
      this.used_credit = 0;
    }
  }

  getBalance(): number {
    return this.balance;
  }

  printStatement(): void {
    if (this.transaction_history.length === 0) {
      console.log("No Transactions have been made.");
      return;
    }
    const TABLE_MAX_WIDTH = 25;

    console.log(`Transaction History:`);

    console.log("-".repeat(TABLE_MAX_WIDTH));

    console.log("Current Balance: " + chalk.yellow(`${this.getBalance()}`));

    console.log("-".repeat(TABLE_MAX_WIDTH));
    for (const entry of this.transaction_history) {
      const total_length =
        entry.entry_type.toString().length + entry.amount.toString().length;
      // *The extra "5" removal is for unaccounted characters being printed in the ROW that arent part of `total_length`
      const repeated_spacing = " ".repeat(TABLE_MAX_WIDTH - total_length - 5);
      console.log(
        `| ${entry.entry_type.replace(entry.entry_type.charAt(0), entry.entry_type.charAt(0).toUpperCase())}: ${entry.entry_type === "deposit" ? chalk.green(`${entry.amount}`) : chalk.red(`${entry.amount}`)}${repeated_spacing}|`,
      );
      console.log("-".repeat(TABLE_MAX_WIDTH));
    }
  }
}

// ---

const bankAccounts: BankAccount[] = [
  new BankAccount("ABN AMRO", "debit", 2121),
  new BankAccount("MCB", "debit", 2020),
  new BankAccount("Wise Credit", "credit", 1818, { credit_limit: 10_000 }),
];

// Main Loop
let runScript = true;
// Inner account operations loop
let account_selector_retry_counter = 0;
// Timer for applying interest
let days_passed = 0;

while (runScript) {
  // Choose Bank Account
  for (const [idx, account] of bankAccounts.entries()) {
    console.log(`${idx + 1}) ${account.account_name}`);
  }
  console.log("-----\n" + chalk.underlineDotted("0) Exit"));
  const accountIdx = Number(myPrompt("Select Account (enter number): ")) - 1; // Subtract 1 to be 0-based index value
  if (account_selector_retry_counter > 3) {
    runScript = false;
    break;
  }
  if (accountIdx === -1) {
    runScript = false;
    continue;
  }
  if (accountIdx > bankAccounts.length - 1 || accountIdx < 0) {
    console.log(chalk.red("Invalid Index. Try again!"));
    account_selector_retry_counter++;
    continue;
  }

  const selectedAccount = bankAccounts[accountIdx];
  console.log(
    chalk.bold(`========== ${selectedAccount.account_name} ==========`),
  );

  // Operate on account
  let operating_on_account = true;
  while (operating_on_account) {
    if (!selectedAccount.handleAccountSecurity()) {
      console.log(chalk.red("Account is Locked!"));
      operating_on_account = false;
      continue;
    }

    days_passed += 10;

    if (days_passed === 30) {
      selectedAccount.applyInterest();
      days_passed = 0;
    }

    const chosenOption = myPrompt(
      "What would you like to do?\n\n1. Deposit\n2. Withdraw\n3. Get Balance\n4. Transaction History\nq - exit\n",
    );

    switch (chosenOption) {
      case "1": {
        const amount = myPrompt("How much would you like to deposit? $");
        selectedAccount.deposit(Number(amount));
        break;
      }
      case "2": {
        const amount = myPrompt("How much would you like to withdraw? $");
        selectedAccount.withdraw(Number(amount));
        break;
      }
      case "3": {
        const balance = selectedAccount.getBalance();
        console.log(
          `Current Balance: ${balance < 0 ? chalk.red(balance) : chalk.green(balance)}`,
        );
        break;
      }
      case "4": {
        selectedAccount.printStatement();
        break;
      }
      case "q": {
        operating_on_account = false;
        break;
      }
      default:
        console.log(chalk.dim("Please enter a valid option."));
        operating_on_account = false;
        continue;
    }
  }
}