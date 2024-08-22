const session = require('express-session');
const config = require('./config/config');
require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

const path = require('path');

const express = require('express');
const app = express();

app.set('view engine','ejs');

app.use("/static",express.static(path.join(__dirname,"public")));


const nocache = require('nocache');
app.use(nocache());


app.use(session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
}));



//userRoute...
const userRoute = require('./routers/userRoute');
app.use('/',userRoute);

//adminRoute...
const adminRoute = require('./routers/adminRoute');
app.use('/admin',adminRoute);

//404 page

app.get('*',(req,res)=> {
    res.render('user/404')
});


//500 page

app.get('*',(req,res)=> {
    res.render('500')
})


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
 
});