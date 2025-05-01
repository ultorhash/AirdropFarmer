import { clober, gaspump } from "./chains/rise";
import { login, switchAccount } from "./utils/metamask";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await login(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `Account ${i}`;
    
    await switchAccount(page, account);
    //await gaspump(context, account, 0.00003, 0.00008)
    await clober(context, account, 0.00005, 0.00007, true, false)
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 21, 60)
  ]);
};

run().catch(console.error);
