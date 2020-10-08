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
    const { title, subject, body, to, amount } = req.body;

    const invoice = new Invoice({
      title,
      body,
      subject,
      to,
      from: req.user.email,
      fromName: req.user.name,
      amount,
      dateSent: Date.now(),
    });

    const mailer = new Mailer(invoice, invoiceTemplate(invoice));

    try {
      await mailer.send();
      await invoice.save();
    } catch (err) {
      res.status(422).send(err);
    }
  });
};
