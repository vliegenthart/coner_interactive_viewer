const queryString = require('query-string');
const crypto = require('crypto');
const request = require('request')
const config = require("./config")



function generateQueryString(endpoint, inputParams, apiKey, requestTimestamp) {
  inputParams["api_key"] = apiKey;
  inputParams["request_timestamp"] = requestTimestamp;
  const queryParamsString = queryString.stringify(inputParams, {arrayFormat: 'bracket'}).replace(/%20/g, '+');
  const stringToSign = endpoint + '?' + queryParamsString;
  return stringToSign;
}

function generateApiSignature(stringToSign, apiSecret) {
  var buff = new Buffer.from(apiSecret, 'utf8');
  var hmac = crypto.createHmac('sha256', buff);
  hmac.update(stringToSign);
  return hmac.digest('hex');
}


function createUser() {
  const baseUrl = "https://playgroundapi.ost.com"
  const endpoint = "/users/create"
  const inputParams = { name: "Alice Anderson" }
  const apiKey = config.apiKey
  const apiSecret = config.apiSecret
  const requestTimeStamp = Math.floor(new Date() / 1000)

  const stringToSign = generateQueryString(endpoint, inputParams, apiKey, requestTimeStamp)
  console.log(stringToSign)
  const signature = generateApiSignature(stringToSign, apiSecret)

  const query = baseUrl + stringToSign + "&signature=" + signature

  const options = {
    url: query,
    headers: {
      'Accept': "application/json"
    }
  }

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log(info);
    }
    else {
      console.log(response.statusCode, JSON.parse(body))
    }
  }

  request.post(options, callback)
}

createUser()
