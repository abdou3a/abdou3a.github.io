class Web3Portfolio {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.provider = null;
        this.contracts = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCryptoPrices();
        this.startPriceUpdates();
        this.loadNFTs();
        this.updatePortfolio();
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => {
            document.getElementById('web3Modal').style.display = 'block';
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('web3Modal').style.display = 'none';
        });

        // Wallet options
        document.querySelectorAll('.wallet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wallet = e.currentTarget.dataset.wallet;
                this.connectWallet(wallet);
            });
        });

        // DeFi interactions
        document.getElementById('executeSwap')?.addEventListener('click', () => this.executeSwap());
        document.getElementById('stakeTokens')?.addEventListener('click', () => this.stakeTokens());
        document.getElementById('unstakeTokens')?.addEventListener('click', () => this.unstakeTokens());
        document.getElementById('claimRewards')?.addEventListener('click', () => this.claimRewards());
        document.getElementById('mintNFT')?.addEventListener('click', () => this.mintNFT());

        // Swap amount calculation
        document.getElementById('swapAmount')?.addEventListener('input', () => this.calculateSwap());
    }

    async connectWallet(walletType) {
        try {
            let provider;
            
            switch(walletType) {
                case 'metamask':
                    if (typeof window.ethereum !== 'undefined') {
                        provider = window.ethereum;
                    } else {
                        throw new Error('MetaMask not installed');
                    }
                    break;
                case 'walletconnect':
                    // WalletConnect integration would go here
                    alert('WalletConnect coming soon!');
                    return;
                case 'coinbase':
                    // Coinbase Wallet integration would go here
                    alert('Coinbase Wallet coming soon!');
                    return;
            }

            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            this.web3 = new Web3(provider);
            
            await this.updateWalletInfo();
            document.getElementById('web3Modal').style.display = 'none';
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet: ' + error.message);
        }
    }

    async updateWalletInfo() {
        if (!this.account) return;

        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const addressElement = walletInfo.querySelector('.wallet-address');
        const balanceElement = walletInfo.querySelector('.wallet-balance');

        // Show wallet info, hide connect button
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'block';

        // Display shortened address
        const shortAddress = `${this.account.substring(0, 6)}...${this.account.substring(38)}`;
        addressElement.textContent = shortAddress;

        // Get and display balance
        try {
            const balance = await this.web3.eth.getBalance(this.account);
            const ethBalance = this.web3.utils.fromWei(balance, 'ether');
            balanceElement.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`;
        } catch (error) {
            balanceElement.textContent = 'Error loading balance';
        }
    }

    async loadCryptoPrices() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin&vs_currencies=usd&include_24hr_change=true');
            const data = await response.json();

            document.getElementById('ethPrice').textContent = `$${data.ethereum.usd.toLocaleString()}`;
            document.getElementById('btcPrice').textContent = `$${data.bitcoin.usd.toLocaleString()}`;
            document.getElementById('bnbPrice').textContent = `$${data.binancecoin.usd.toLocaleString()}`;

            // Add color coding based on 24h change
            this.updatePriceColor('ethPrice', data.ethereum.usd_24h_change);
            this.updatePriceColor('btcPrice', data.bitcoin.usd_24h_change);
            this.updatePriceColor('bnbPrice', data.binancecoin.usd_24h_change);

        } catch (error) {
            console.error('Error loading crypto prices:', error);
        }
    }

    updatePriceColor(elementId, change) {
        const element = document.getElementById(elementId);
        if (change > 0) {
            element.style.color = '#27ae60';
        } else if (change < 0) {
            element.style.color = '#e74c3c';
        }
    }

    startPriceUpdates() {
        // Update prices every 30 seconds
        setInterval(() => {
            this.loadCryptoPrices();
        }, 30000);
    }

    loadNFTs() {
        const nftGrid = document.getElementById('nftGrid');
        const sampleNFTs = [
            { id: 1, name: 'Crypto Cat #1', price: '0.5 ETH', image: 'fas fa-cat' },
            { id: 2, name: 'Digital Art #42', price: '1.2 ETH', image: 'fas fa-palette' },
            { id: 3, name: 'Space NFT #777', price: '0.8 ETH', image: 'fas fa-rocket' },
            { id: 4, name: 'Music Note #3', price: '0.3 ETH', image: 'fas fa-music' },
        ];

        nftGrid.innerHTML = sampleNFTs.map(nft => `
            <div class="nft-card">
                <div class="nft-image">
                    <i class="${nft.image}"></i>
                </div>
                <div class="nft-info">
                    <div class="nft-name">${nft.name}</div>
                    <div class="nft-price">${nft.price}</div>
                </div>
            </div>
        `).join('');
    }

    async calculateSwap() {
        const amount = document.getElementById('swapAmount').value;
        const fromToken = document.getElementById('tokenFrom').value;
        const toToken = document.getElementById('tokenTo').value;
        
        if (!amount || amount <= 0) {
            document.getElementById('swapResult').value = '';
            return;
        }

        // Simulate exchange rate calculation
        const exchangeRates = {
            'ETH-USDC': 2000,
            'USDC-ETH': 0.0005,
            'ETH-USDT': 2000,
            'USDT-ETH': 0.0005,
            'USDC-USDT': 1,
            'USDT-USDC': 1
        };

        const pair = `${fromToken}-${toToken}`;
        const rate = exchangeRates[pair] || 1;
        const result = (parseFloat(amount) * rate * 0.997).toFixed(6); // 0.3% fee

        document.getElementById('swapResult').value = result;
    }

    async executeSwap() {
        if (!this.account) {
            alert('Please connect your wallet first');
            return;
        }

        const amount = document.getElementById('swapAmount').value;
        const fromToken = document.getElementById('tokenFrom').value;
        const toToken = document.getElementById('tokenTo').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // Simulate swap transaction
        const confirmation = confirm(`Swap ${amount} ${fromToken} for ${document.getElementById('swapResult').value} ${toToken}?`);
        
        if (confirmation) {
            try {
                // In a real implementation, this would interact with a DEX smart contract
                alert('Swap initiated! Transaction hash: 0x' + Math.random().toString(16).substr(2, 64));
                
                // Reset form
                document.getElementById('swapAmount').value = '';
                document.getElementById('swapResult').value = '';
                
            } catch (error) {
                alert('Swap failed: ' + error.message);
            }
        }
    }

    async stakeTokens() {
        if (!this.account) {
            alert('Please connect your wallet first');
            return;
        }

        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            alert('Please enter a valid staking amount');
            return;
        }

        try {
            // Simulate staking transaction
            alert(`Staking ${amount} tokens! Transaction hash: 0x` + Math.random().toString(16).substr(2, 64));
            document.getElementById('stakeAmount').value = '';
            this.updateRewards();
        } catch (error) {
            alert('Staking failed: ' + error.message);
        }
    }

    async unstakeTokens() {
        if (!this.account) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            alert('Unstaking tokens! Transaction hash: 0x' + Math.random().toString(16).substr(2, 64));
            this.updateRewards();
        } catch (error) {
            alert('Unstaking failed: ' + error.message);
        }
    }

    async claimRewards() {
        if (!this.account) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            const rewards = document.getElementById('pendingRewards').textContent;
            alert(`Claiming ${rewards} ETH rewards! Transaction hash: 0x` + Math.random().toString(16).substr(2, 64));
            document.getElementById('pendingRewards').textContent = '0.0';
        } catch (error) {
            alert('Claim failed: ' + error.message);
        }
    }

    updateRewards() {
        // Simulate pending rewards
        const randomRewards = (Math.random() * 0.1).toFixed(4);
        document.getElementById('pendingRewards').textContent = randomRewards;
    }

    async mintNFT() {
        if (!this.account) {
            alert('Please connect your wallet first');
            return;
        }

        const quantity = document.getElementById('mintQuantity').value;
        const totalCost = (0.05 * quantity).toFixed(2);

        const confirmation = confirm(`Mint ${quantity} NFT(s) for ${totalCost} ETH?`);
        
        if (confirmation) {
            try {
                alert(`Minting ${quantity} NFT(s)! Transaction hash: 0x` + Math.random().toString(16).substr(2, 64));
                // Reload NFTs to show new ones
                setTimeout(() => this.loadNFTs(), 2000);
            } catch (error) {
                alert('Minting failed: ' + error.message);
            }
        }
    }

    updatePortfolio() {
        // Simulate portfolio data
        const portfolioValue = (Math.random() * 50000 + 10000).toFixed(2);
        const change = (Math.random() * 20 - 10).toFixed(2);
        
        document.getElementById('portfolioValue').textContent = `$${parseFloat(portfolioValue).toLocaleString()}`;
        
        const changeElement = document.getElementById('portfolioChange');
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
        changeElement.className = change >= 0 ? 'value-change' : 'value-change negative';

        // Update portfolio chart
        this.drawPortfolioChart();
    }

    drawPortfolioChart() {
        const canvas = document.getElementById('portfolioChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Generate sample data points
        const dataPoints = [];
        for (let i = 0; i < 30; i++) {
            dataPoints.push(Math.random() * 100 + 50);
        }

        // Draw chart
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = (index / (dataPoints.length - 1)) * width;
            const y = height - (point / 150) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Fill area under curve
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }
}

// Initialize Web3 Portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Web3Portfolio();
});
