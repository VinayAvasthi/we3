// --- Contract Details ---
const contractAddress = "0xc89bc66c35Fc21fe7de40b00b4181D048c6760a3";
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "bytes32", "name": "propertyId", "type": "bytes32" },
			{ "indexed": true, "internalType": "address", "name": "oldOwner", "type": "address" },
			{ "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
		],
		"name": "PropertyTransferred",
		"type": "event"
	},
	{
		"inputs": [{ "internalType": "bytes32", "name": "_propertyId", "type": "bytes32" }],
		"name": "getOwner",
		"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "bytes32", "name": "_propertyId", "type": "bytes32" }],
		"name": "registerProperty",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "bytes32", "name": "_propertyId", "type": "bytes32" },
			{ "internalType": "address", "name": "_newOwner", "type": "address" }
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Ethers.js v6 variables
let provider;
let signer;
let contract;
let account;

const accountStatusEl = document.getElementById('accountStatus');
const ownerAddressEl = document.getElementById('ownerAddress');

/**
 * Connect wallet
 */
async function connectWallet() {
    try {
        if (typeof window.ethereum !== "undefined") {
            // v6: Web3Provider replaced with BrowserProvider
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            account = signer.address; // v6: signer has .address property

            // Create contract instance
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            accountStatusEl.textContent = `Connected: ${account}`;
            console.log("Connected to account:", account);
        } else {
            accountStatusEl.textContent = "Please install a Web3 wallet like MetaMask!";
            console.error("MetaMask or similar wallet not installed.");
        }
    } catch (error) {
        if (error.code === 4001) {
            accountStatusEl.textContent = "Connection rejected. Please approve in your wallet.";
        } else {
            accountStatusEl.textContent = `Error connecting: ${error.message}`;
            console.error("Initialization failed:", error);
        }
    }
}

/**
 * Convert string → bytes32
 */
function stringToBytes32(str) {
    const bytes = ethers.toUtf8Bytes(str); // v6: utils removed, functions are top-level
    if (bytes.length > 32) {
        throw new Error("String exceeds 32 bytes and cannot be converted to bytes32.");
    }
    return ethers.hexlify(ethers.zeroPadBytes(bytes, 32)); // v6: zeroPadBytes replaces hexZeroPad
}

/**
 * Register property
 */
/**
 * Register property
 */
async function registerProperty(propertyIdStr) {
    const statusEl = document.getElementById('registerStatus');
    statusEl.textContent = ""; // reset
    if (!contract || !propertyIdStr) {
        accountStatusEl.textContent = "Error: Wallet not connected or property ID missing.";
        return;
    }
    try {
        const propertyIdBytes32 = stringToBytes32(propertyIdStr);
        console.log("Registering property:", propertyIdStr);
        const tx = await contract.registerProperty(propertyIdBytes32);
        accountStatusEl.textContent = "Transaction sent, waiting for confirmation...";
        await tx.wait();
        accountStatusEl.textContent = `Property registered! Tx Hash: ${tx.hash}`;

        // ✅ Show green tick
        statusEl.innerHTML = "✅ Property registered successfully!";
        statusEl.style.color = "green";
    } catch (error) {
        accountStatusEl.textContent = `Error: ${error.shortMessage || error.message}`;
        statusEl.innerHTML = "❌ Failed to register property.";
        statusEl.style.color = "red";
        console.error("Error registering property:", error);
    }
}



/**
 * Transfer ownership
 */
/**
 * Transfer ownership
 */
async function transferOwnership(propertyIdStr, newOwnerAddress) {
    const statusEl = document.getElementById('transferStatus');
    statusEl.textContent = ""; // reset
    if (!contract || !propertyIdStr || !newOwnerAddress) {
        accountStatusEl.textContent = "Error: Wallet not connected or missing details.";
        return;
    }
    try {
        const propertyIdBytes32 = stringToBytes32(propertyIdStr);
        console.log("Transferring ownership:", propertyIdStr, "→", newOwnerAddress);
        const tx = await contract.transferOwnership(propertyIdBytes32, newOwnerAddress);
        accountStatusEl.textContent = "Transaction sent, waiting for confirmation...";

        // ✅ Immediately show "Request sent to buyer"
        statusEl.textContent = "📩 Request sent to buyer.";
        statusEl.style.color = "blue";

        await tx.wait();
        accountStatusEl.textContent = `Ownership transferred! Tx Hash: ${tx.hash}`;
    } catch (error) {
        accountStatusEl.textContent = `Error: ${error.shortMessage || error.message}`;
        statusEl.innerHTML = "❌ Failed to transfer ownership.";
        statusEl.style.color = "red";
        console.error("Error transferring ownership:", error);
    }
}

/**
 * Get current owner
 */
async function getOwner(propertyIdStr) {
    if (!contract || !propertyIdStr) {
        accountStatusEl.textContent = "Error: Wallet not connected or property ID missing.";
        return;
    }
    try {
        const propertyIdBytes32 = stringToBytes32(propertyIdStr);
        ownerAddressEl.textContent = "Fetching...";
        const owner = await contract.getOwner(propertyIdBytes32);
        ownerAddressEl.textContent = owner;
        console.log("Owner address:", owner);
    } catch (error) {
        ownerAddressEl.textContent = "Error";
        console.error("Error fetching owner:", error);
    }
}

// Event Listeners
document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);

document.getElementById('registerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const propertyId = document.getElementById('regPropertyId').value;
    registerProperty(propertyId);
});

document.getElementById('transferForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const propertyId = document.getElementById('transferPropertyId').value;
    const newOwner = document.getElementById('transferNewOwner').value;
    transferOwnership(propertyId, newOwner);
});

document.getElementById('detailsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const propertyId = document.getElementById('detailsPropertyId').value;
    getOwner(propertyId);
});
