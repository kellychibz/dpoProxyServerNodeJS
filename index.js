const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { DOMParser } = require('xmldom');
const moment = require('moment');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
  origin: 'https://d9210-discon2025.webflow.io/checkout'
}));

app.get('/process-payment', async (req, res) => {
    const amount = req.query.amount;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/xml");

    const currentDate = moment().format('YYYY/MM/DD HH:mm');

    const raw = `<?xml version="1.0" encoding="utf-8"?>
    <API3G>
    <CompanyToken>B3F59BE7-0756-420E-BB88-1D98E7A6B040</CompanyToken>
    <Request>createToken</Request>
    <Transaction>
        <PaymentAmount>${amount}</PaymentAmount>
        <PaymentCurrency>USD</PaymentCurrency>
        <CompanyRef>49FKEOA</CompanyRef>
        <RedirectURL>http://d9210-discon2025.webflow.io/success</RedirectURL>
        <BackURL>http://d9210-discon2025.webflow.io/failed </BackURL>
        <CompanyRefUnique>0</CompanyRefUnique>
        <PTL>5</PTL>
    </Transaction>
    <Services>
        <Service>
        <ServiceType>85325</ServiceType>
        <ServiceDescription>d9210ConferencePayment</ServiceDescription>
        <ServiceDate>${currentDate}</ServiceDate>
        </Service>
    </Services>
    </API3G>`;
    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };
    const response = await fetch("https://secure.3gdirectpay.com/API/v6/", requestOptions);
    const data = await response.text();

    // Parse the XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    // Extract the TransToken
    const transToken = xmlDoc.getElementsByTagName("TransToken")[0].textContent;

    // Construct the payment URL
    const paymentUrl = `https://secure.3gdirectpay.com/payv3.php?ID=${transToken}`;

    // Redirect the user to the payment URL
    res.redirect(paymentUrl);

    console.log(`Payment URL: ${paymentUrl}`);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




