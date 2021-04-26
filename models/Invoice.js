const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  title: String,
  body: String,
  from: String,
  fromName: String,
  to: String,
  dateSent: Date,
  fullAmount: Number,
  amount: Number,
  phone: String,
  paypalmail: String,
  stripemail: String,
  bitcoinAddress: String,
  pending: Number,
});

mongoose.model('invoices', invoiceSchema);
