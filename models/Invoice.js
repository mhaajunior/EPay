const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  title: String,
  body: String,
  subject: String,
  from: String,
  fromName: String,
  to: String,
  dateSent: Date,
  amount: Number,
});

mongoose.model('invoices', invoiceSchema);
