//-----------Importing all the pakages in this module-------------//
const express = require('express');
var bodyParser = require('body-parser');
const route = require('./routes/route.js');
const app = express();
const responseTime = require('response-time')
app.use(responseTime());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//------------------------Global middleware to time and path on which request hitted---------------------------//
var dateTime = require('node-datetime');
const midGlb = function (req, res, next) {
    var dt = dateTime.create();
    var formatted = dt.format('D-m-y H:M:S');
    console.log(formatted, req.originalUrl);
    next()
}
app.use(midGlb)

//----We are connecting to MongoDb database using mongoose-------------// To store our data------//
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://user-open-to-all:hiPassword123@cluster0.xgk0k.mongodb.net/Aman_Kumar?retryWrites=true&w=majority", { useNewUrlParser: true })
    .then(() => console.log('mongodb running and connected'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});