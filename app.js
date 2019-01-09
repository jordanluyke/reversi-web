const express = require('express')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const app = express()

require('dotenv').config({ path: '/home/ubuntu/sync/reversi/.env' })

app.use((req, res, next) => {
    res.set('X-Frame-Options', 'SAMEORIGIN')
    next()
})
app.use(cookieParser())
app.use(compression())
app.use(express.static('client/target'))
require('./routes/status-route')(app)
require('./routes/core-proxy-route')(app)
require('./routes/app-route')(app)

module.exports = app

