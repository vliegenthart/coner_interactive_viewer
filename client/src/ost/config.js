const config = {};

if (true || process.env.NODE_ENV === 'development') {
  config.tokenName = "Coner Token"
  config.tokenTicker = "CNR"
  config.apiKey = "0ffdfbfcc518ae27b68f"
  config.apiSecret = "7aa580525418c03268a31e5d23c1ebff86504d46a3386d98eb2dd028d490728b"
  config.companyUuid = "9d974c32-f8ca-4152-9ceb-2033a8e74d16"
  config.chainId = "1409"
  config.viewerBaseUrl ="https://view.ost.com/chain-id/1409/transaction/"
}
else {
  config.tokenName = "Daniel Token"
  config.tokenTicker = "DTDT"
  config.apiKey = "22954c2198f99b42ae54"
  config.apiSecret = "d0705065648cef5c3ec571ad2d8e661fbd8a86f51d5dfd5356d3bf5d650c9e11"
  config.companyUuid = "387d9e6e-cc12-411c-8273-44d20e361974"
  config.chainId = "1409"
  config.viewerBaseUrl ="https://view.ost.com/chain-id/1409/transaction/"

}

// config.ostApiEndpoint = process.env.NODE_ENV === 'production'
//   ? "https://playgroundapi.ost.com/"
//   : 'http://localhost:3000/proxy/';

config.ostApiEndpoint = '/proxy/'
config.devMode = true

// module.exports.ost_config = config;

export default config;