import { ethers } from "hardhat"
import { utils } from "ethers"

async function main() {
    const tokenFactory = await ethers.getContractFactory("CadaoToken")
    const token = await tokenFactory.deploy()

    await token.deployed()

    const govFactory = await ethers.getContractFactory("CadaoGovernor")
    const governor = await govFactory.deploy(token.address)

    await governor.deployed()

    const vendorFactory = await ethers.getContractFactory("CadaoVendor")
    const vendor = await vendorFactory.deploy(token.address)

    await vendor.deployed()

    console.log('Transfering all the tokens to the vendor...')
    const totalSupply = await token.totalSupply()
    await token.transfer(vendor.address, totalSupply)

    console.log(`Token deployed at ${token.address}`)
    console.log(`Governor contract deployed at ${governor.address}`)
    console.log(`Vendor contract deployed at ${vendor.address}`)

    const vendorBalance = await token.balanceOf(vendor.address)
    console.log(`Vendor balance is ${vendorBalance}`)
}


main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
