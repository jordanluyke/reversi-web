const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const compression = require('compression')
const app = express()
const fs = require('fs-extra')

app.use((req, res, next) => {
    res.set('X-Frame-Options', 'SAMEORIGIN')
    next()
})
fs.pathExists("client/public/img/fav.ico")
    .then(exists => app.use(favicon(path.join(__dirname, `client/${exists ? "public" : "target"}/img/fav.ico`))))
// app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(compression())
app.use(express.static('client/target'))
require('./routes/status-route')(app)
require('./routes/core-proxy-route')(app)
require('./routes/app-route')(app)

module.exports = app

