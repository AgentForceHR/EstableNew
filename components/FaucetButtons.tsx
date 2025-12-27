import { ethers } from "ethers";
import deployments from "../deployments/base-sepolia.json";

const ABI = ["function mintFaucet(uint256 amount)"];

export default function FaucetButtons() {
  async function mint(symbol: "USDC" | "USDT" | "DAI") {
    if (!window.ethereum) return alert("Install wallet");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const token = (deployments as any).tokens[symbol];
    const contract = new ethers.Contract(token.address, ABI, signer);
    const amount = ethers.parseUnits("1000", token.decimals);

    const tx = await contract.mintFaucet(amount);
    await tx.wait();
    alert(`Minted 1000 test ${symbol}`);
  }

  return (
    <div className="mt-4 flex gap-2">
      <button onClick={() => mint("USDC")}>Get test USDC</button>
      <button onClick={() => mint("USDT")}>Get test USDT</button>
      <button onClick={() => mint("DAI")}>Get test DAI</button>
    </div>
  );
}
