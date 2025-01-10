
const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();


const mongoose = require('mongoose');
const CryptoData = require('./config/database');
const cron = require('node-cron');


//Task 1
const fetchCryptoData = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: 'bitcoin,matic-network,ethereum',
      },
    });

    const cryptoList = response.data;
    console.log('Fetched Data:', cryptoList);

    const cryptoDocs = cryptoList.map((crypto) => ({
      name: crypto.name,
      currentPrice: crypto.current_price,
      marketCap: crypto.market_cap,
      change24h: crypto.price_change_percentage_24h,
    }));

    // Save data to the database
    await CryptoData.insertMany(cryptoDocs);
    console.log('Crypto data saved successfully!');
  } catch (error) {
    console.error('Error fetching crypto data:', error.message);
  }
};


cron.schedule('0 */2 * * *', async () => {
  console.log('Fetching cryptocurrency data...');
  await fetchCryptoData();
});







//Task 2
app.get('/stats', async (req, res) => {
    try {
        const { coin } = req.query;
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                ids: `${coin}`,
            },
        });
      
      const cryptoData=response.data;
      console.log(cryptoData);
      res.json({
        price: cryptoData[0].current_price,
        marketCap: cryptoData[0].market_cap,
        "24hChange": cryptoData[0].price_change_24h,
      });
    } catch (error) {
      console.error('Error fetching stats:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
});



//task 3

const calculateStandardDeviation = (prices) => {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const squaredDiffs = prices.map((price) => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
    return Math.sqrt(variance);
  };
  
  // Route to get the standard deviation of prices for a specific cryptocurrency
  app.get('/deviation', async (req, res) => {
    try {
      const { coin } = req.query;
  
      if (!coin) {
        return res.json({ error: 'Missing required query parameter: coin' });
      }
  
      const records = await CryptoData.find({ id: coin })
        .sort({ fetchedAt: -1 })
        .limit(100);
  
      if (records.length === 0) {
        return res.status(404).json({ error: 'No data found for the requested cryptocurrency' });
      }
  
      
      const prices = records.map((record) => record.currentPrice);
  
      const deviation = calculateStandardDeviation(prices);
  
      res.json({ deviation: deviation.toFixed(2) });
    } catch (error) {
      console.error('Error calculating deviation:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});



