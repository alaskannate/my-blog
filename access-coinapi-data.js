require('dotenv').config();
const fetch = require ('node-fetch');

 
fetch('https://rest.coinapi.io/v1/exchangerate/ETH/USD', {
  headers: {
    "X-CoinAPI-Key":process.env.COIN_API_KEY
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));