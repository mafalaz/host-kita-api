const express = require('express')
const app = express()
const port = 5000
//import library CORS
const cors = require('cors')

//use cors
app.use(cors())

//import body parser
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//import route posts
const postsRouter = require('./routes/auth');
app.use('/api/auth', postsRouter);

//import route order
const orderRouter = require('./routes/order');
app.use('/api/user', orderRouter);

const fotoProfilRoute = require('./routes/getFotoProfil');
app.use('/api/user', fotoProfilRoute);

const rekeningRouter = require('./routes/rekening');
app.use('/api/user', rekeningRouter);

const addUserOrderRouter = require('./routes/orderRoutes');
app.use('/api/user', addUserOrderRouter);

const authAdmin = require('./routes/authAdmin');
app.use('/api/admin', authAdmin);

const penjualan = require('./routes/penjualan');
app.use('/api/admin', penjualan);

const jadwal = require('./routes/jadwal');
app.use('/api/admin', jadwal);

const getPayment = require('./routes/getPayment');
app.use('/api/admin', getPayment);

const penawaran = require('./routes/penawaran');
app.use('/api/admin', penawaran);

app.listen(port, () => {
  console.log(`app running at http://localhost:${port}`)
})