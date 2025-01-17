const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
const router = new express.Router();
const sharp = require('sharp');

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }

    // Same as
    /* user.save().then(() => {
        res.status(201).send(user);
    }).catch((error) => {
        res.status(400).send(error);
    }); */
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch(error) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch(error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch(error) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.get('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findOne({ _id });

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch(error) {
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        // The findByIdAndUpdate method bypasses mongoose, it performs a direct operation on the db. Use this to make middlewear run correctly
        // const user = await User.findById(req.user._id);

        updates.forEach((update) => req.user[update] = req.body[update]);

        await req.user.save();

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.send(req.user);
    } catch(error) {
        res.status(400).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        /*const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).send();
        }*/

        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch(error) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a .jpg, .jpeg or .png image'));
        }

        cb(undefined, true);
    }
});

router.post('users/me/pdf', auth, upload.single('pdf'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).pdf().toBuffer();
    req.user.pdf = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message + '. Max file size is 1MB'});
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }
        // http://localhost:3000/users/5fc16330d608da44f0f97c00/avatar
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(error) {
        res.status(404).send();
    }
});

router.get('/users/:id/pdf', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.pdf) {
            throw new Error()
        }

        res.set('Content-Type', 'image/pdf');
        res.send(user.pdf);
    } catch(error) {
        res.status(404).send();
    }
});

module.exports = router;