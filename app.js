const express = require('express')
const cookieParser = require('cookie-parser')
// const bodyParser = require('body-parser')
const compression = require('compression')
const app = express()

app.use((req, res, next) => {
    res.set('X-Frame-Options', 'SAMEORIGIN')
    next()
})
// app.use(bodyParser.json())
app.use(cookieParser())
// app.use(bodyParser.urlencoded({extended: true}))
app.use(compression())
app.use(express.static('client/target'))
require('./routes/status-route')(app)
require('./routes/core-proxy-route')(app)
require('./routes/app-route')(app)

module.exports = app

