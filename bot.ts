import { hammyFinance } from "./chains/xrpl-evm";
import { login, switchAccount } from "./utils/metamask";

const password = "!Stolica34!";

const steps = async (password: string, fromAccount: number, toAccount: number): Promise<void> => {
  const { context, page } = await login(password);

  for (let i = fromAccount; i <= toAccount; i++) {
    const account = `Account ${i}`;
    
    await switchAccount(page, account);
    await hammyFinance(context, account, 1, 3);
  }

  await context.close();
}

const run = async (): Promise<void> => {
  await Promise.all([
    steps(password, 1, 20)
  ]);
};

run().catch(console.error);
