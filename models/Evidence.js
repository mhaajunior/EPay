const mongoose = require('mongoose');
const { Schema } = mongoose;

const evidenceSchema = new Schema({
  creditormail: String,
  debtormail: String,
  amount: Number,
  debtorname: String,
  dateRecieved: Date,
  type: String,
  title: String,
  refNo: String,
  correct: { type: Boolean, default: false },
  incorrect: { type: Boolean, default: false },
  _invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  _payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
});

mongoose.model('evidences', evidenceSchema);
