/* eslint-env mocha */

const { ZERO_ADDRESS, sha3, abiEncodePacked, anyToHex } = require('@netgum/utils')
const { signPersonalMessage } = require('../utils')

const Account = artifacts.require('Account')
const StateToken = artifacts.require('StateToken')
const ExampleStateTokenProvider = artifacts.require('ExampleStateTokenProvider')

function buildCreate2Address (creatorAddress, salt, byteCode) {
  const parts = [
    'ff',
    creatorAddress,
    salt,
    sha3(byteCode).toString('hex')
  ].map((part) => part.startsWith('0x')
    ? part.slice(2)
    : part
  )

  const partsHash = sha3(`0x${parts.join('')}`).toString('hex')

  return `0x${partsHash.slice(-40)}`.toLowerCase()
}

contract('ExampleStateTokenProvider', (devices) => {
  let provider
  const guardianDevice = devices[0]
  let guardianAccount

  before(async () => {
    guardianAccount = await Account.new()
    await guardianAccount.initialize([guardianDevice])

    provider = await ExampleStateTokenProvider.new(
      ZERO_ADDRESS,
      guardianAccount.address,
      StateToken.bytecode
    )
  })

  describe('burnToken()', () => {
    it('should burn token', async () => {
      const claimer = devices[2]

      const founderAccount = await Account.new()
      const founderDevice = devices[1]
      await founderAccount.initialize([founderDevice])

      const tokenUniqueId = 10
      const tokenValue = 5000
      const tokenAddress = buildCreate2Address(
        provider.address,
        sha3(abiEncodePacked('uint256', 'address')(tokenUniqueId, founderAccount.address)).toString('hex'),
        StateToken.bytecode
      )

      // top-up
      await web3.eth.sendTransaction({
        from: founderDevice,
        to: tokenAddress,
        value: tokenValue
      })

      const tokenFounderStateHash = anyToHex(sha3('0x01020304'), { add0x: true })
      const tokenFounderMessage = abiEncodePacked(
        'uint256',
        'address',
        'bytes',
        'address'
      )(
        tokenUniqueId,
        founderAccount.address,
        tokenFounderStateHash,
        claimer
      )

      const tokenFounderSignature = signPersonalMessage(tokenFounderMessage, founderDevice)
      const guardianSignature = signPersonalMessage(tokenFounderSignature, guardianDevice)

      const { receipt: { gasUsed } } = await provider.burnToken(
        tokenUniqueId,
        founderAccount.address,
        tokenFounderStateHash,
        tokenFounderSignature,
        guardianSignature, {
          from: claimer
        }
      )
      console.log('providerBalance:', await web3.eth.getBalance(provider.address))
      console.log('claimerBalance:', await web3.eth.getBalance(claimer))
      console.log('tokenBalance:', await web3.eth.getBalance(tokenAddress))
      console.log(gasUsed)
    })
  })
})
