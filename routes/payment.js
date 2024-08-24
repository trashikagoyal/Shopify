const express = require('express');
const router = express.Router();
const request = require('request');
const jsSHA = require('jssha');
const { v4: uuid } = require('uuid');
const { isLoggedIn } = require('../middleware');

router.post('/payment_gateway/payumoney', isLoggedIn, (req, res) => {
    req.body.txnid = uuid(); // Here pass txnid and it should be different on every call
    req.body.email = req.user.email;
    req.body.firstname = req.user.username; // Here save all the details in pay object 

    const pay = req.body;

    const hashString = process.env.MERCHANT_KEY + '|' + pay.txnid + '|' + pay.amount + '|' + pay.productinfo + '|' + pay.firstname + '|' + pay.email + '|' + '||||||||||' + process.env.MERCHANT_SALT;

    const sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString);
    const hash = sha.getHash("HEX");

    pay.key = process.env.MERCHANT_KEY;
    pay.surl = 'http://localhost:5000/payment/success';
    pay.furl = 'http://localhost:5000/payment/fail';
    pay.hash = hash;

    request.post({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: 'https://sandboxsecure.payu.in/_payment', // Testing url
        form: pay
    }, function (error, httpRes, body) {
        if (error) {
            res.send({
                status: false,
                message: error.toString()
            });
            return; // Add a return statement to exit the function in case of error
        }

        if (httpRes && httpRes.statusCode === 200) { // Check if httpRes is defined
            res.send(body);
        } else if (httpRes && httpRes.statusCode >= 300 && httpRes.statusCode <= 400) { // Check if httpRes is defined
            res.redirect(httpRes.headers.location.toString());
        } else {
            res.status(500).send({ // Handle other status codes
                status: false,
                message: 'Unexpected error occurred.'
            });
        }
    });
});

// success route
router.post('/payment/success', (req, res) => {
    res.send(req.body);
});

router.post('/payment/fail', (req, res) => {
    res.send(req.body);
});

module.exports = router;
