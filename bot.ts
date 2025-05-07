import { b3x, clober, gaspump, inarifi } from "./chains/rise";
import { metamaskLogin, metamaskSwitchAccount } from "./utils/wallets";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await metamaskLogin(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const rabbyAccount = `Account ${i}`;
    
    await metamaskSwitchAccount(page, rabbyAccount);
  }

  // await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 1, 1)
  ]);
};

run().catch(console.error);
