const MySchema = require('./models/model');  // Import the User model
const express = require('express')
const crypto = require("node:crypto");
const { 
    generateRegistrationOptions, 
    verifyRegistrationResponse, 
    generateAuthenticationOptions, 
    verifyAuthenticationResponse 
} = require('@simplewebauthn/server')


if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

const PORT = 3000
const app = express();

// app.use(express.static('./public'))
app.use(express.json())

const cors = require('cors');
const { log } = require('node:console');
app.use(cors());



// States
const userStore = {}
const challengeStore = {}

app.post('/register', (req, res) => {
    const { username, password } = req.body
    const id = `employee_${Date.now()}`

    const user = {
        id,
        username,
    }

    userStore[id] = user

    console.log(`Register successfull`, userStore[id])

    return res.json({ id })

})



app.post('/register-challenge', async (req, res) => {
    const { userId } = req.body

    console.log(req.body);

    if (!userStore[userId]) return res.status(404).json({ error: 'user not found!' })

    const user = userStore[userId]

    const challengePayload = await generateRegistrationOptions({
        rpID: 'localhost',
        rpName: 'My Localhost Machine',
        attestationType: 'none',
        userName: user.username,
        timeout: 30_000,
    })

    challengeStore[userId] = challengePayload.challenge

    return res.json({ options: challengePayload })

})

app.post('/register-verify', async (req, res) => {
    const { userId, cred }  = req.body
    
    if (!userStore[userId]) return res.status(404).json({ error: 'user not found!' })

    const user = userStore[userId]
    const challenge = challengeStore[userId]

    const verificationResult = await verifyRegistrationResponse({
        expectedChallenge: challenge,
        expectedOrigin: 'http://localhost:4200',
        expectedRPID: 'localhost',
        response: cred,
    })

    if (!verificationResult.verified) return res.json({ error: 'could not verify' });
    userStore[userId].passkey = verificationResult.registrationInfo

    return res.json({ user: userStore[userId] })

})

app.post('/login-challenge', async (req, res) => {
    const { userId } = req.body

    const existingEmployee = await MySchema.Passkeys.findOne({
        employeeid: userId
    });

    // console.log('Employee found:', existingEmployee);
    
    if (!existingEmployee) {
        return res.status(400).json({
            message: 'Employee with this ID not registered',
            status: 400,
            employee: existingEmployee
        });
    }

    userStore[userId] = {
        employeeid: existingEmployee.employeeid,
        passkey: {
            fmt: existingEmployee.fmt,
            counter: existingEmployee.counter,
            aaguid: existingEmployee.aaguid,
            credentialID: existingEmployee.credentialID,
            credentialPublicKey: existingEmployee.credentialPublicKey,
            credentialType: existingEmployee.credentialType,
            attestationObject: existingEmployee.attestationObject,
            userVerified: existingEmployee.userVerified,
            credentialDeviceType: existingEmployee.credentialDeviceType,
            credentialBackedUp: existingEmployee.credentialBackedUp,
            origin: existingEmployee.origin,
            rpID: existingEmployee.rpID,
        }
    };

    if (!userStore[userId]) return res.status(404).json({ error: 'user not found!' })
    
    const opts = await generateAuthenticationOptions({
        rpID: 'localhost',
    })

    challengeStore[userId] = opts.challenge

    return res.json({ options: opts })
})


app.post('/login-verify', async (req, res) => {
    const { userId, cred } = req.body;

    if (!userStore[userId]) return res.status(404).json({ error: 'User not found!' });

    const authenticatedUser = userStore[userId].passkey;
    const challenge = challengeStore[userId];

    if (!authenticatedUser || !authenticatedUser.credentialPublicKey) {
        return res.status(400).json({ error: 'Passkey data is missing or incomplete!' });
    }

    // ✅ Convert credentialPublicKey from object to Buffer
    const publicKeyBuffer = Buffer.from(Object.values(authenticatedUser.credentialPublicKey));

    const authenticator = {
        ...authenticatedUser,
        credentialPublicKey: publicKeyBuffer, // 🔥 Fix: Pass a Buffer instead of an object
    };

    try {
        const result = await verifyAuthenticationResponse({
            expectedChallenge: challenge,
            expectedOrigin: 'http://localhost:4200',
            expectedRPID: 'localhost',
            response: cred,
            authenticator
        });

        if (!result.verified) return res.json({ error: 'Something went wrong during verification' });

        return res.json({ user: userStore[userId] });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});



// app.post('/login-verify', async (req, res) => {
//     const { userId, cred }  = req.body

//     if (!userStore[userId]) return res.status(404).json({ error: 'user not found!' })
//     const user = userStore[userId]
//     const challenge = challengeStore[userId]

//     const result = await verifyAuthenticationResponse({
//         expectedChallenge: challenge,
//         expectedOrigin: 'http://localhost:4200',
//         expectedRPID: 'localhost',
//         response: cred,
//         authenticator: user.passkey
//     })

//     if (!result.verified) return res.json({ error: 'something went wrong' })
    
//     // Login the user: Session, Cookies, JWT
//     return res.json({ user: userStore[userId] })
// })


app.listen(PORT, () => console.log(`Server started on PORT:${PORT}`))