'use client'

import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract } from 'wagmi'
import  gameAbi  from '../abis/game.json';
import { use, useEffect, useState } from 'react';
import { getConfig } from '@/wagmi';
import { formatUnits, parseUnits } from 'viem';
import { forma, sepolia } from 'viem/chains';
import { readContract } from 'wagmi/actions';
import { sep } from 'path';
import Stats from '@/components/Stats';


function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()



  




  // const addCoins = async () => {
  //   writeContract({
  //     address: '0xCA5252048Cf8D01aD003471C257995dfDCbB3BcC',
  //     abi: gameAbi,
  //     functionName: 'addCoins',
  //     args: [],
  //     value: BigInt("10000000000000")
      
  //   })
  // }

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={async () =>  await disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

     <Stats />
          
        
    
    </>
  )
}

export default App
