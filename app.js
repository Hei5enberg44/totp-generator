const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const express = require('express')
const app = express()
const port = 3002

app.set('view engine', 'ejs')
app.use(express.json())

function validateToken(token, secret) {
    const tokenValidates = speakeasy.totp.verify({
        secret: secret,
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

    const qr = await QRCode.toDataURL(secret.otpauth_url)

    res.render('index', {
        qrcode: qr,
        secret: secret.base32
    })
})

app.post('/validateToken', (req, res) => {
    const token = req.body.token
    const secret = req.body.secret

    if(token && secret) {
        res.json({ valid: validateToken(token, secret) })
    } else {
        res.status(404).send('Token manquant dans la requête')
    }
})

app.listen(port)