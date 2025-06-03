import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers';

// Initial State
const initialState = {
  web3: null,
  account: null,
  chainId: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
  provider: null,
  signer: null,
  contracts: {},
  portfolioData: {
    totalValue: 0,
    tokens: [],
    nfts: [],
    defiPositions: []
  },
  cryptoPrices: {},
  transactions: [],
  error: null
};

// Action Types
const ActionTypes = {
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ACCOUNT: 'SET_ACCOUNT',
  SET_BALANCE: 'SET_BALANCE',
  SET_CHAIN_ID: 'SET_CHAIN_ID',
  SET_CONTRACTS: 'SET_CONTRACTS',
  SET_PORTFOLIO_DATA: 'SET_PORTFOLIO_DATA',
  SET_CRYPTO_PRICES: 'SET_CRYPTO_PRICES',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const web3Reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CONNECTING:
      return { ...state, isConnecting: action.payload, error: null };
    
    case ActionTypes.SET_CONNECTED:
      return {
        ...state,
        web3: action.payload.web3,
        provider: action.payload.provider,
        signer: action.payload.signer,
        isConnected: true,
        isConnecting: false,
        error: null
      };
    
    case ActionTypes.SET_DISCONNECTED:
      return {
        ...initialState
      };
    
    case ActionTypes.SET_ACCOUNT:
      return { ...state, account: action.payload };
    
    case ActionTypes.SET_BALANCE:
      return { ...state, balance: action.payload };
    
    case ActionTypes.SET_CHAIN_ID:
      return { ...state, chainId: action.payload };
    
    case ActionTypes.SET_CONTRACTS:
      return { ...state, contracts: { ...state.contracts, ...action.payload } };
    
    case ActionTypes.SET_PORTFOLIO_DATA:
      return { ...state, portfolioData: action.payload };
    
    case ActionTypes.SET_CRYPTO_PRICES:
      return { ...state, cryptoPrices: action.payload };
    
    case ActionTypes.ADD_TRANSACTION:
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions.slice(0, 99)] 
      };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isConnecting: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context
const Web3Context = createContext();

// Provider Component
export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Smart Contract ABIs (simplified)
  const contractABIs = {
    erc20: [
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint amount) returns (bool)"
    ],
    nft: [
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function tokenURI(uint256 tokenId) view returns (string)"
    ],
    staking: [
      "function stake(uint256 amount) external",
      "function unstake(uint256 amount) external",
      "function getReward() external",
      "function earned(address account) view returns (uint256)"
    ]
  };

  // Connect Wallet
  const connectWallet = useCallback(async (walletType = 'metamask') => {
    dispatch({ type: ActionTypes.SET_CONNECTING, payload: true });

    try {
      let provider;

      switch (walletType) {
        case 'metamask':
          if (typeof window.ethereum !== 'undefined') {
            provider = window.ethereum;
          } else {
            throw new Error('MetaMask not installed');
          }
          break;
        case 'walletconnect':
          // WalletConnect implementation
          throw new Error('WalletConnect not implemented yet');
        case 'coinbase':
          // Coinbase Wallet implementation
          throw new Error('Coinbase Wallet not implemented yet');
        default:
          throw new Error('Unsupported wallet type');
      }

      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      // Setup Web3 and Ethers
      const web3Instance = new Web3(provider);
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      // Get network info
      const chainId = await web3Instance.eth.getChainId();
      const balance = await web3Instance.eth.getBalance(accounts[0]);

      dispatch({
        type: ActionTypes.SET_CONNECTED,
        payload: {
          web3: web3Instance,
          provider: ethersProvider,
          signer: signer
        }
      });

      dispatch({ type: ActionTypes.SET_ACCOUNT, payload: accounts[0] });
      dispatch({ type: ActionTypes.SET_CHAIN_ID, payload: chainId });
      dispatch({ 
        type: ActionTypes.SET_BALANCE, 
        payload: web3Instance.utils.fromWei(balance, 'ether') 
      });

      // Setup event listeners
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      // Load contracts
      await loadContracts(ethersProvider, signer);

      // Load portfolio data
      await loadPortfolioData(accounts[0]);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, []);

  // Load Smart Contracts
  const loadContracts = async (provider, signer) => {
    try {
      const contracts = {};

      // Example contract addresses (replace with real ones)
      const contractAddresses = {
        usdc: '0xA0b86a33E6441cF9eF0b09D2a97e0a11C7EcB0B0',
        nft: '0x1234567890123456789012345678901234567890',
        staking: '0x0987654321098765432109876543210987654321'
      };

      // Load ERC20 contract (USDC example)
      if (contractAddresses.usdc) {
        contracts.usdc = new ethers.Contract(
          contractAddresses.usdc,
          contractABIs.erc20,
          signer
        );
      }

      dispatch({ type: ActionTypes.SET_CONTRACTS, payload: contracts });
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  // Load Portfolio Data
  const loadPortfolioData = async (account) => {
    try {
      // Simulate portfolio data loading
      const portfolioData = {
        totalValue: Math.random() * 100000 + 10000,
        tokens: [
          { symbol: 'ETH', balance: '2.5', value: 5000 },
          { symbol: 'USDC', balance: '15000', value: 15000 },
          { symbol: 'UNI', balance: '250', value: 1500 }
        ],
        nfts: [
          { id: 1, name: 'CryptoPunk #1234', value: 50 },
          { id: 2, name: 'Bored Ape #5678', value: 80 }
        ],
        defiPositions: [
          { protocol: 'Uniswap V3', type: 'Liquidity', value: 25000, apy: 15.5 },
          { protocol: 'Compound', type: 'Lending', value: 10000, apy: 8.2 }
        ]
      };

      dispatch({ type: ActionTypes.SET_PORTFOLIO_DATA, payload: portfolioData });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    }
  };

  // Load Crypto Prices
  const loadCryptoPrices = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin,uniswap,chainlink&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();

      const prices = {
        ethereum: {
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change
        },
        bitcoin: {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change
        },
        binancecoin: {
          price: data.binancecoin.usd,
          change24h: data.binancecoin.usd_24h_change
        },
        uniswap: {
          price: data.uniswap.usd,
          change24h: data.uniswap.usd_24h_change
        },
        chainlink: {
          price: data.chainlink.usd,
          change24h: data.chainlink.usd_24h_change
        }
      };

      dispatch({ type: ActionTypes.SET_CRYPTO_PRICES, payload: prices });
    } catch (error) {
      console.error('Error loading crypto prices:', error);
    }
  }, []);

  // Event Handlers
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      dispatch({ type: ActionTypes.SET_DISCONNECTED });
    } else {
      dispatch({ type: ActionTypes.SET_ACCOUNT, payload: accounts[0] });
      loadPortfolioData(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    dispatch({ type: ActionTypes.SET_CHAIN_ID, payload: parseInt(chainId, 16) });
  };

  const handleDisconnect = () => {
    dispatch({ type: ActionTypes.SET_DISCONNECTED });
  };

  // Disconnect Wallet
  const disconnectWallet = useCallback(() => {
    dispatch({ type: ActionTypes.SET_DISCONNECTED });
  }, []);

  // Execute Transaction
  const executeTransaction = useCallback(async (transactionData) => {
    if (!state.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await state.signer.sendTransaction(transactionData);
      
      const transaction = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: transaction });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Update transaction status
      const confirmedTransaction = {
        ...transaction,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

      dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: confirmedTransaction });

      return receipt;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [state.signer]);

  // Initialize
  useEffect(() => {
    loadCryptoPrices();
    const interval = setInterval(loadCryptoPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [loadCryptoPrices]);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    executeTransaction,
    loadPortfolioData,
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR })
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Hook
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
