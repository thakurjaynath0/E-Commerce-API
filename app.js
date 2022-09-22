require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

//rest of the packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

//database
const connectDb = require('./db/connect');

//routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

//middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
app.use(fileUpload());

//routes
app.get('/', (req,res)=>{
    // console.log(req.cookies);
    console.log(req.signedCookies);
    res.send('E-Commerce API');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const port = process.env.PORT || 5000;
const start = async()=>{
    try {
        await connectDb(process.env.MONGO_URL);
        console.log('Connected to the Db...');
        app.listen(port, ()=>{
            console.log(`Server is listening at port:${port}...`);
        });
    } catch (error) {
        console.log(error);
    }
};

start(); 