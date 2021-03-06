const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const express = require('express')
const app = express()
const port = 3002

app.set('view engine', 'ejs')
app.use(express.json())

app.get('/', async (req, res) => {
    res.render('index')
})

app.get('/generateTOTP', async (req, res) => {
    const name = req.query.name
    const length = req.query.length ? parseInt(req.query.length) : 8

    if(name) {
        if(length < 8 || length > 48) {
            res.status(400).send('La longueur du secret doit être compris entre 8 et 48')
        } else {
            const secret = speakeasy.generateSecret({
                length: length,
                name: name
            })

            const qr = await QRCode.toDataURL(secret.otpauth_url)

            res.json({
                qrcode: qr,
                secret: secret.base32
            })
        }
    } else {
        res.status(400).send('Nom manquant dans la requête')
    }
})

app.post('/validateToken', (req, res) => {
    const token = req.body.token
    const secret = req.body.secret

    if(token && secret) {
        const tokenValidates = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token
        })
        res.json({ valid: tokenValidates })
    } else {
        res.status(400).send('Token manquant dans la requête')
    }
})

app.listen(port)