const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Mailer = require('../services/Mailer');
const invoiceTemplate = require('../services/invoiceTemplate');

const Invoice = mongoose.model('invoices');

module.exports = (app) => {
  app.get('/api/invoices', requireLogin, async (req, res) => {
    const invoices = await Invoice.find({ to: req.user.email });

    res.send(invoices);
  });

  app.post('/api/invoices', requireLogin, async (req, res) => {
    const {
      title,
      body,
      to,
      amount,
      phone,
      mail,
      smail,
      bitaddress,
    } = req.body;

    const invoice = new Invoice({
      title,
      body,
      to,
      from: req.user.email,
      fromName: req.user.name,
      fullAmount: amount,
      amount,
      phone,
      paypalmail: mail,
      stripemail: smail,
      bitcoinAddress: bitaddress,
      pending: 0,
      dateSent: Date.now(),
    });

    const mailer = new Mailer(invoice, invoiceTemplate(invoice));

    try {
      await mailer.send();
      await invoice.save();
      res.send(req.user);
    } catch (err) {
      res.status(422).send(err);
    }
  });

  app.get('/api/owninvoices', requireLogin, async (req, res) => {
    const invoices = await Invoice.find({ from: req.user.email });
    res.send(invoices);
  });

  app.delete('/api/:id/deleteinvoice', requireLogin, async (req, res) => {
    const { id } = req.params;
    Invoice.deleteOne(
      {
        _id: id,
      },
      (err) => {
        if (err) throw err;
        console.log('1 document deleted');
      }
    );

    res.send('success');
  });
};
