const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.DB_URI);

const cryptoDataSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    marketCap: { type: Number, required: true },
    change24h: { type: Number, required: true },
    fetchedAt: { type: Date, default: Date.now },
  });

  const CryptoData = mongoose.model('CryptoData', cryptoDataSchema);

  module.exports = CryptoData;