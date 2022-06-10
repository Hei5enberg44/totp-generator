const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const express = require('express')
const cookieSession = require('cookie-session')
const app = express()
const port = 3005

app.set('view engine', 'ejs')
app.use(cookieSession({
    name: 'session',
    keys: ['YbwHwELe229SKZUQ']
}))
app.use(express.json())

function validateToken(token, secret) {
    const tokenValidates = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: token
    })

    return tokenValidates
}

app.get('/', async (req, res) => {
    const secret = speakeasy.generateSecret({
        length: 10,
        name: 'SylverApp'
    })

    req.session.secret = secret

    const qr = await QRCode.toDataURL(secret.otpauth_url)

    res.render('index', {
        qrcode: qr,
        secret: secret.base32
    })
})

app.post('/validateToken', (req, res) => {
    const token = req.body.token

    if(token) {
        res.json({ valid: validateToken(token, req.session.secret) })
    } else {
        res.status(404).send('Token manquant dans la requête')
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})