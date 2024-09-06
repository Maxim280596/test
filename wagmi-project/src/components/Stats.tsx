import React, { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useReadContract,
} from "wagmi";
import gameAbi from "../abis/game.json";
import tokenAbi from "../abis/token.json";
import { getConfig } from "@/wagmi";
import { formatUnits, parseUnits } from "viem";
import { forma, sepolia } from "viem/chains";
import { getBalance, readContract } from "wagmi/actions";
import { WEIGHTED_POOL_ABI, VAULT_ABI } from "../abi";

const GAME_TOKEN_ADDRESS = "0x0D71d1B2918f20858dc2B5dFf404FDE17D95EF7A";
const GAME_ADDRESS = "0xCA5252048Cf8D01aD003471C257995dfDCbB3BcC";
const VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const WEIGHTED_POOL_FACTORY = "0x7920BFa1b2041911b354747CA7A6cDD2dfC50Cfd";
const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

function Stats() {
  const account = useAccount();
  const [value, setValue] = useState("0");
  const [coins, setCoins] = useState("0");
  const [yields, setYields] = useState("0");
  const [currentFloor, setCurrentFloor] = useState(0);
  const [txForWin, setTxForWin] = useState(0);
  const [ethBalance, setEthBalance] = useState("0");
  const [gtBalance, setGtBalance] = useState("0");
  const [gtPrice, setGtPrice] = useState("0");
  const [ethPrice, setEthPrice] = useState("0");
  const [wethBalanceInPool, setWethBalanceInPool] = useState("0");
  const [gtBalanceInPool, setGtBalanceInPool] = useState("0");
  const { writeContract } = useWriteContract();
  const config = getConfig();

  const [floor, setFloor] = useState("0");

  function handleChange(event: any) {
    event.preventDefault();
    setValue(event.target.value);
  }

  function handleFloorChange(event: any) {
    event.preventDefault();
    setFloor(event.target.value);
  }

  const updatePoolStats = async () => {
    const poolAddress = await readContract(config, {
      abi: gameAbi,
      address: GAME_ADDRESS,
      functionName: "balancerPool",
      args: [],
      chainId: sepolia.id,
    });
    if (poolAddress != "0x0000000000000000000000000000000000000000") {
      const poolId = await readContract(config, {
        abi: WEIGHTED_POOL_ABI,
        address: poolAddress,
        functionName: "getPoolId",
        args: [],
        chainId: sepolia.id,
      });
      console.log(poolId, "poolId");
      const weights: any = await readContract(config, {
        abi: WEIGHTED_POOL_ABI,
        address: poolAddress,
        functionName: "getNormalizedWeights",
        args: [],
        chainId: sepolia.id,
      });
      console.log(weights, "weights");
      const poolTokens: any = await readContract(config, {
        abi: VAULT_ABI,
        address: VAULT,
        functionName: "getPoolTokens",
        args: [poolId],
        chainId: sepolia.id,
      });
      console.log(poolTokens, "poolTokens");
      setWethBalanceInPool(formatUnits(poolTokens[1][1], 18));
      setGtBalanceInPool(formatUnits(poolTokens[1][0], 18));
      const oneEthPrice =
        (parseUnits("1", 18) * poolTokens[1][0]) / poolTokens[1][1];
      const oneGTPrice =
        (parseUnits("1", 18) * poolTokens[1][1]) / poolTokens[1][0];
      console.log(oneEthPrice.toString(), "oneEthPrice");
      //   const gtCalculation = poolTokens[1][0] * weights[0];
      //   const wethCalculation = poolTokens[1][1] * weights[1];
      //   const wethToGTprice = wethCalculation / gtCalculation;
      //   const gtToWETHprice = gtCalculation / wethCalculation;
      //   console.log(wethToGTprice, "wethToGTprice");
      //   console.log(gtToWETHprice, "gtToWETHprice");

      setEthPrice(formatUnits(oneGTPrice, 18));
      setGtPrice(formatUnits(oneEthPrice, 18));
    }
    // const pool = await ethers.getContractAt(
    //     WEIGHTED_POOL_ABI,
    //     await game.balancerPool()
    //   );
    //   const poolID = await pool.getPoolId();
    //   const weights = await pool.getNormalizedWeights();
    //   const poolTokens = await vault.getPoolTokens(poolID);

    //   const wethCalculation = poolTokens.balances[0] * weights[0];
    //   const gtCalculation = poolTokens.balances[1] * weights[1];
    //   const wethToGTprice = wethCalculation / gtCalculation;
    //   const gtToWETHprice = gtCalculation / wethCalculation;
  };

  const updateGameStats = async () => {
    const result: any = await readContract(config, {
      abi: gameAbi,
      address: "0xCA5252048Cf8D01aD003471C257995dfDCbB3BcC",
      functionName: "towers",
      args: [account.address],
      chainId: sepolia.id,
    });
    const result2: any = await readContract(config, {
      abi: gameAbi,
      address: "0xCA5252048Cf8D01aD003471C257995dfDCbB3BcC",
      functionName: "getBuilders",
      args: [account.address],
      chainId: sepolia.id,
    });
    console.log(result2);
    setCoins(result[0].toString());
    setYields(result[1].toString());

    //// make sum of all array elements
    let sum = 0;
    for (let i = 0; i < result2.length; i++) {
      sum += parseInt(result2[i]);
    }

    let leftTx = 40 - sum;
    setTxForWin(leftTx);

    let floor = 8 - Math.floor(leftTx / 5);
    console.log("Floor:", floor);
    setCurrentFloor(floor);
    if (account.address) {
      const balance = await getBalance(config, {
        address: account?.address,
        chainId: sepolia.id,
        unit: "ether",
      });
      setEthBalance(balance.formatted);

      const gtBalance: bigint = await readContract(config, {
        abi: tokenAbi,
        address: GAME_TOKEN_ADDRESS,
        functionName: "balanceOf",
        args: [account.address],
        chainId: sepolia.id,
      });
      setGtBalance(formatUnits(gtBalance, 18));
    }
  };

  useEffect(() => {
    updateGameStats();
  }, []);

  useEffect(() => {
    console.log("Yields updated:", yields);
  }, [yields]);

  return (
    <div className="g-container">
      <div className="container">
        <div className="action">
          <h2>Add Coins to Game</h2>
          <input
            type="number"
            id="coins"
            placeholder="ETH"
            value={value}
            onChange={(e) => handleChange(e)}
          />
          <button
            type="button"
            onClick={async () => {
              await writeContract({
                address: "0xCA5252048Cf8D01aD003471C257995dfDCbB3BcC",
                abi: gameAbi,
                functionName: "addCoins",
                args: [],
                value: BigInt(parseUnits(value, 18)),
              });
            }}
          >
            addCoins
          </button>
        </div>
        <div className="action">
          <h2>Upgrade Tower</h2>
          <p>По 5 транзакцій, від 0 до 7</p>
          <input
            type="number"
            id="floor"
            placeholder="Floor"
            value={floor}
            onChange={(e) => handleFloorChange(e)}
          />

          <button
            type="button"
            onClick={async () => {
              await writeContract({
                address: "0xCA5252048Cf8D01aD003471C257995dfDCbB3BcC",
                abi: gameAbi,
                functionName: "upgradeTower",
                args: [floor],
              });
            }}
          >
            Upgrade Tower
          </button>
        </div>
        <div className="action">
          <h2>Collect Money</h2>
          <p>Раз в 24 хвилини</p>
          <button
            type="button"
            onClick={async () => {
              await writeContract({
                address: GAME_ADDRESS,
                abi: gameAbi,
                functionName: "collectMoney",
                args: [],
              });
            }}
          >
            Collect
          </button>
        </div>
        <div className="action">
          <h2>Withdraw ETH rewards </h2>
          <p>Вивід зароблених винагород в грі</p>
          <button
            type="button"
            onClick={async () => {
              await writeContract({
                address: GAME_ADDRESS,
                abi: gameAbi,
                functionName: "withdrawMoney",
                args: [],
                account: account.address,
              });
            }}
          >
            WithdrawMoney
          </button>
        </div>
        <div className="action">
          <h2>Claim token for winner </h2>
          <p>Клейм токена за перемогу</p>
          <button
            type="button"
            onClick={async () => {
              await writeContract({
                address: GAME_ADDRESS,
                abi: gameAbi,
                functionName: "claimGameToken",
                args: [account.address],
                account: account.address,
              });
            }}
          >
            ClaimGT
          </button>
        </div>
      </div>

      <div className="container">
        <div className="stats">
          <h2>Game Stats</h2>
          <button type="button" onClick={async () => await updateGameStats()}>
            Refresh
          </button>
          <div>
            <h5>ETH Balance : {ethBalance}</h5>
          </div>
          <div>
            <h5>Coins : {coins}</h5>
          </div>
          <div>
            <h5>GT Balance: {gtBalance}</h5>
          </div>
          <div>
            <h5>Total Yield: {yields}</h5>
          </div>
          <div>
            <h5>Current Floor: {currentFloor}</h5>
          </div>
          <div>
            <h5>Transactions for win: {txForWin}</h5>
          </div>
          <div>
            <h2>Balancer Pool Stats</h2>
            <p>Лише після першого клейму, можна побачити</p>
            <h5>1 ETH up to : {gtPrice} GT</h5>
            <h5>1 GT up to : {ethPrice} ETH</h5>
            <h5>WETH in Balancer pool: {wethBalanceInPool}</h5>
            <h5>GT in Balancer pool: {gtBalanceInPool}</h5>
            <button type="button" onClick={async () => await updatePoolStats()}>
              Refresh Balancer Pool Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
