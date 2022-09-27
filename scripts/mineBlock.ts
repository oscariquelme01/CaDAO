import { ethers } from "hardhat"

async function mineNBlocks(n: number) {
    for (let index = 0; index < n; index++) {
        await ethers.provider.send('evm_mine');
    }
}

mineNBlocks(10)
