import { ethers } from "hardhat"

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function mineNBlocks(n: number) {
    for (let index = 0; index < n; index++) {
        await ethers.provider.send('evm_mine');
    }
}

async function main() {
    while (true) {
        // Wait 13 seconds and mine 1 block 
        mineNBlocks(1)
        await delay(13000)
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
