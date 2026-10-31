import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import process from "node:process";

const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
const password = await terminal.question("Enter the admin password to hash: ");
terminal.close();
if (password.length < 1) {
  console.error("Password must not be empty.");
  process.exit(1);
}
console.log(`\nADMIN_PASSWORD_HASH=${await bcrypt.hash(password, 12)}`);
console.log("Store this value only in your server's private environment.");