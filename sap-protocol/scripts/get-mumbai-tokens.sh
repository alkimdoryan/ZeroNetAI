#!/bin/bash
# Mumbai Testnet Token Acquisition Script
# Task 7.3: Acquire test tokens

echo "🚀 SAP Protocol Token Acquisition"
echo "=================================="

# Check if wallet address is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <wallet_address>"
    echo "Example: $0 0x1234567890123456789012345678901234567890"
    exit 1
fi

WALLET_ADDRESS=$1

echo "Wallet Address: $WALLET_ADDRESS"
echo ""

# Function to open faucet URLs
open_faucet() {
    local name=$1
    local url=$2
    echo "🌐 Opening $name..."
    echo "URL: $url"
    
    # Copy wallet address to clipboard (macOS)
    echo "$WALLET_ADDRESS" | pbcopy
    echo "✅ Wallet address copied to clipboard"
    
    # Open URL in default browser
    open "$url"
    echo ""
}

echo "Opening Mumbai testnet faucets..."
echo "Your wallet address has been copied to clipboard for easy pasting."
echo ""

# Open all faucets
open_faucet "Polygon Faucet" "https://faucet.polygon.technology/"
sleep 2

open_faucet "Mumbai Faucet" "https://mumbaifaucet.com/"
sleep 2

open_faucet "Alchemy Faucet" "https://www.alchemy.com/faucets/polygon-mumbai"
sleep 2

open_faucet "QuickNode Faucet" "https://faucet.quicknode.com/polygon/mumbai"

echo "✅ All faucets opened!"
echo ""
echo "📝 Instructions:"
echo "1. Paste your wallet address in each faucet"
echo "2. Complete required verifications"
echo "3. Request test MATIC tokens"
echo "4. Wait for confirmations"
echo ""
echo "🔍 Check balance: https://mumbai.polygonscan.com/address/$WALLET_ADDRESS"
