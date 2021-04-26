const mongoose = require('mongoose');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');
const paypal = require('paypal-rest-sdk');
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);

const Invoice = mongoose.model('invoices');
const Payment = mongoose.model('payments');

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: keys.paypalClientID,
  client_secret: keys.paypalClientSecret,
});

module.exports = (app) => {
  app.get('/api/:id', requireLogin, async (req, res) => {
    const requestId = req.params.id;
    const invoice = await Invoice.findOne({ _id: requestId });

    res.send(invoice);
  });

  app.post('/api/promptpay', requireLogin, async (req, res) => {
    const { values, id, phone } = req.body;

    const payment = new Payment({
      amount: values.amount,
      phone,
      _invoice: id,
      type: 'Promptpay',
      status: 'pending',
    });
    await payment.save();

    const invoice = await Invoice.findOne({ _id: id });
    invoice.pending += parseInt(values.amount);
    await invoice.save();

    res.send(payment);
  });

  app.post('/api/createqr', requireLogin, async (req, res) => {
    const { phone, amount } = req.body;

    const mobileNumber = phone;
    // amount = parseInt(amount);
    const payload = generatePayload(mobileNumber, { amount });

    const options = { color: { dark: '#000', light: '#fff' } };
    qrcode.toFile('./client/src/qr.png', payload, options, (err) => {
      if (err) throw err;
      console.log('done');
    });
  });

  app.post('/api/stripe', requireLogin, async (req, res) => {
    const { values, id, mail } = req.body;

    const payment = new Payment({
      amount: values.amount,
      mail,
      _invoice: id,
      type: 'Stripe',
      status: 'pending',
    });
    await payment.save();

    const invoice = await Invoice.findOne({ _id: id });
    invoice.pending += parseInt(values.amount);
    await invoice.save();

    res.send(payment);
  });

  app.post('/api/createstripe', requireLogin, async (req, res) => {
    const { amount, id } = req.body;
    const YOUR_DOMAIN = 'http://localhost:3000/database/' + id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'Epay',
              images: [
                'https://media-exp1.licdn.com/dms/image/C510BAQGA42E_lhCXaQ/company-logo_200_200/0/1519865121873?e=2159024400&v=beta&t=f5r9OE9gznC45jOS2L31UM6kgFfQ9zMpon2xMIDJR1A',
              ],
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });
    res.json({ id: session.id });
  });

  app.post('/api/paypal', requireLogin, async (req, res) => {
    const { values, id, mail } = req.body;

    const payment = new Payment({
      amount: values.amount,
      mail,
      _invoice: id,
      type: 'Paypal',
      status: 'pending',
    });
    await payment.save();

    const invoice = await Invoice.findOne({ _id: id });
    invoice.pending += parseInt(values.amount);
    await invoice.save();

    res.send(payment);
  });

  app.post('/api/createpaypal', async (req, res) => {
    const { amount, id, paymentid } = req.body;
    const amountInUSD = (amount / 30.555).toFixed(2);

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://localhost:3000/success/' + id + '/' + paymentid,
        cancel_url: 'http://localhost:3000/cancel',
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'Epay Transaction',
                sku: '001',
                price: amountInUSD,
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: amountInUSD,
          },
          description: 'Payment transaction from EPay.',
        },
      ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            // res.redirect(payment.links[i].href);
            res.send(payment.links[i].href);
          }
        }
      }
    });
  });

  app.get('/api/success/:paymentId/:payerId/:id', async (req, res) => {
    const { paymentId, payerId, id } = req.params;
    const payment = await Payment.findOne({ _id: id });
    const amountInUSD = (payment.amount / 30.555).toFixed(2);

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: amountInUSD,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
        }
      }
    );
  });

  app.post('/api/bitcoin', requireLogin, async (req, res) => {
    const { values, id, address } = req.body;

    const payment = new Payment({
      amount: values.amount,
      bitcoinAddress: address,
      _invoice: id,
      type: 'Bitcoin',
      status: 'pending',
    });
    await payment.save();

    const invoice = await Invoice.findOne({ _id: id });
    invoice.pending += parseInt(values.amount);
    await invoice.save();

    res.send(payment);
  });

  app.get('/api/:id/payments', requireLogin, async (req, res) => {
    const requestId = req.params.id;
    const payments = await Payment.find({ _invoice: requestId });

    res.send(payments);
  });

  app.get('/api/:id/payment', requireLogin, async (req, res) => {
    const requestId = req.params.id;
    const payment = await Payment.findOne({ _id: requestId });

    res.send(payment);
  });

  app.delete('/api/:paymentid/delete', requireLogin, async (req, res) => {
    const { paymentid } = req.params;
    const { invoiceid, amount } = req.query;
    Payment.deleteOne(
      {
        _id: paymentid,
      },
      (err) => {
        if (err) throw err;
        console.log('1 document deleted');
      }
    );

    const invoice = await Invoice.findOne({ _id: invoiceid });
    invoice.pending -= amount;
    await invoice.save();

    res.send('success');
  });
};
