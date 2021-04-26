const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  type: String,
  amount: Number,
  phone: String,
  status: String,
  mail: String,
  bitcoinAddress: String,
  _invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
});

mongoose.model('payments', paymentSchema);
