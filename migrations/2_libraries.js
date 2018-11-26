const BytesSignatureLibrary = artifacts.require('BytesSignatureLibrary')
const ExampleStateTokenProvider = artifacts.require('ExampleStateTokenProvider')

module.exports = async (deployer) => {
  await deployer.deploy(BytesSignatureLibrary)

  deployer.link(BytesSignatureLibrary, ExampleStateTokenProvider)
}
