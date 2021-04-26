const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Evidence = mongoose.model('evidences');
const Invoice = mongoose.model('invoices');
const Payment = mongoose.model('payments');

module.exports = (app) => {
  app.post('/api/evidence', requireLogin, async (req, res) => {
    const {
      amount,
      mymail,
      debtor,
      debtormail,
      id,
      type,
      title,
      paymentid,
      refNo,
    } = req.body;

    const evidence = new Evidence({
      amount,
      creditormail: mymail,
      debtormail,
      debtorname: debtor,
      dateRecieved: Date.now(),
      type,
      title,
      refNo,
      _invoice: id,
      _payment: paymentid,
    });
    await evidence.save();

    const payment = await Payment.findOne({ _id: paymentid });
    payment.status = 'complete';
    await payment.save();

    const invoice = await Invoice.findOne({ _id: id });
    invoice.amount -= amount;
    invoice.pending -= amount;
    await invoice.save();

    res.send(invoice);
  });

  app.get('/api/:id/evidence', requireLogin, async (req, res) => {
    const evidences = await Evidence.find({ creditormail: req.user.email });
    res.send(evidences);
  });

  app.post('/api/correct', requireLogin, async (req, res) => {
    const { id } = req.body;
    const evidence = await Evidence.findOne({ _id: id });
    evidence.correct = true;
    await evidence.save();
    res.send('ok');
  });

  app.post('/api/incorrect', requireLogin, async (req, res) => {
    const { id } = req.body;
    const evidence = await Evidence.findOne({ _id: id });
    evidence.incorrect = true;
    await evidence.save();
    res.send('ok');
  });
};
