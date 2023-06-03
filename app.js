const express = require('express')
const app = express()
const port = 3002
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/UserRoutes');
const adminRoutes =require('./src/routes/AdminRoutes')
const db = require('./src/db/db');
const NodeCache = require( "node-cache" );
const moncocache = new NodeCache( { stdTTL: 86400, checkperiod: 120 } );
global.moncocache = moncocache;
const Memcached = require('memcached');
const memcached = new Memcached('localhost:11211',{retries:10,retry:10000,remove:true,failOverServers:['192.168.0.103:11211']});
global.memcached = memcached;
var cors = require('cors');
//const makeMiddleware = require('multer/lib/make-middleware');
// mongoose.connect('mongodb://localhost:27017/meansso',{
//     useNewUrlParser:true,
//     useUnifiedTopology:true
// });
// const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log("Database Connected");
});

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// function makeMiddlewares(req,res,next){
// console.log(req.body)
// next()
// }
// app.use(makeMiddlewares)
app.use('/assets', express.static('assets'))
app.use('/user',userRoutes);
app.use('/admin',adminRoutes);
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})