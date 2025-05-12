// src/components/Voting.tsx

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import VotingContract from '../../ethereum-voting-contract/build/contracts/Voting.json';
import type { AbiItem } from 'web3-utils';

// Define types for candidate and votes
interface Votes {
  [candidate: string]: number;
}

const Voting: React.FC = () => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [contract, setContract] = useState<InstanceType<Web3['eth']['Contract']> | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [votes, setVotes] = useState<Votes>({});
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState<string>('');

const web3 = new Web3('http://127.0.0.1:9545');
  useEffect(() => {
    const init = async () => {
     
      

      try {
         const accountsList = await web3.eth.getAccounts();
      setAccounts(accountsList);
      setSelectedAccount(accountsList[0]);
        const networkId = await web3.eth.net.getId();
        console.log("Network id: " + networkId)
        const deployedNetwork = (VotingContract.networks as any)[networkId.toString()];

        if (deployedNetwork) {
          const contractInstance = new web3.eth.Contract(
            VotingContract.abi as AbiItem[],
            deployedNetwork.address
          );
          setContract(contractInstance);

          const candidates: string[] = await contractInstance.methods.getCandidates().call();
          setCandidates(candidates);

          const votes: Votes = {};
          for (const candidate of candidates) {
            votes[candidate] = await contractInstance.methods.getVotes(candidate).call();
          }
          setVotes(votes);
        }
      } catch (error) {
        console.error('Error accessing the wallet', error);
      }
    };
    init();
  }, []);

   const vote = async () => {
  if (contract && selectedCandidate && selectedAccount) {
    try {
      const gas = (await contract.methods.vote(selectedCandidate).estimateGas({ from: selectedAccount })).toString();
      const gasPrice = (await web3.eth.getGasPrice()).toString(); // Fetch current gas price

      await contract.methods.vote(selectedCandidate).send({
        from: selectedAccount,
        gas,
        gasPrice // Use legacy gas pricing
      });

      const votesCount = await contract.methods.getVotes(selectedCandidate).call() as number;
      setVotes({ ...votes, [selectedCandidate]: votesCount });
    } catch (error) {
      console.error('Error during transaction', error);
    }
  }
};
 const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
  };

  return (
    <div>
      <h2>Ethereum Voting DApp</h2>
      <div>
        <label>Select Account: </label>
        <select onChange={handleAccountChange} value={selectedAccount}>
          {accounts.map((account, index) => (
            <option key={index} value={account}>{account}</option>
          ))}
        </select>
      </div>
      <div>
        <select onChange={(e) => setSelectedCandidate(e.target.value)} value={selectedCandidate}>
          <option value="">Select Candidate</option>
          {candidates.map((candidate, index) => (
            <option key={index} value={candidate}>{candidate}</option>
          ))}
        </select>
        <button onClick={vote} disabled={!selectedCandidate}>Vote</button>
      </div>
      <div>
        <h3>Results</h3>
        {candidates.map((candidate, index) => (
          <p key={index}>{candidate}: {votes[candidate]} votes</p>
        ))}
      </div>
    </div>
  );
};

export default Voting;