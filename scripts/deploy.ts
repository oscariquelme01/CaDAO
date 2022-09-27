import { ethers } from "hardhat"
import { utils } from "ethers"

async function main(){
    const tokenFactory = await ethers.getContractFactory("CadaoToken")
    const token = await tokenFactory.deploy()

    await token.deployed()

    console.log(typeof(token))

    const govFactory = await ethers.getContractFactory("CadaoGovernor")
    const governor = await govFactory.deploy(token.address)

    await governor.deployed()

    console.log(`Token deployed at ${token.address}`)
    console.log(`Governor contract deployed at ${governor.address}`)
}

async function delegate(account: string) {

}
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
