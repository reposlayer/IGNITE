import express from 'express';
import cors from 'cors';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const app = express();
app.use(cors());
app.use(express.json());

const connection = new Connection('https://api.devnet.solana.com');

// Example keypair for minting; generated at runtime.
// In production you should load this from a secure location.
const serverKeypair = Keypair.generate();

app.post('/airdrop', async (req, res) => {
  try {
    const { address } = req.body;
    const signature = await connection.requestAirdrop(new PublicKey(address), 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    res.json({ signature });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { to, amount } = req.body;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: serverKeypair.publicKey,
        toPubkey: new PublicKey(to),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL)
      })
    );
    const signature = await connection.sendTransaction(transaction, [serverKeypair]);
    await connection.confirmTransaction(signature);
    res.json({ signature });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (_, res) => {
  res.send('Solana backend running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
