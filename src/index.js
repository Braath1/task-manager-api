const app = require('./app');
const port = process.env.PORT;

// File upload
/*const multer = require('multer');
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.endsWith('.pdf')) {
            return cb(new Error('Please upload a PDF'));
        }

        /* Upload word documents using regular expression
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a Word document'));
        } */
        /*
        cb(undefined, true);
    }
});

const errorMiddleware = (req, res, next) => {
    throw new Error('From my middleware');
}

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

/*
app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.send('GET requests are disabled');
    } else {
        next();
    }
});

app.use((req, res, next) => {
        res.status(503).send('Site is under maintenance, please try again later!');
});
*/

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

/*
const Task = require('./models/task');
const User = require('./models/user');

const main = async () => {
    /*const task = await Task.findById('5fc14918fd626b51343dae66');
    await task.populate('owner').execPopulate();
    console.log(task.owner);

    const user = await User.findById('5fc16330d608da44f0f97c00');
    await user.populate('tasks').execPopulate();
    console.log(user.tasks);
}


main();
*/