// Connections
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const app = express();
const port = 3001;
const uri = "mongodb+srv://luiscarlograna2:I56TCByMNeH8OJxM@examen2ux.ocb6t.mongodb.net/?retryWrites=true&w=majority";
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

var admin = require('firebase-admin');
var serviceAccount = require('./examen2-ux-c80b8-firebase-adminsdk-1oacl-f6650cf1ae.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const auth = admin.auth();

const firebaseConfig = {
    apiKey: "AIzaSyCuOdploMBF3E6SlB4_y_SfY3xniIfVseI",
    authDomain: "examen2-ux-c80b8.firebaseapp.com",
    projectId: "examen2-ux-c80b8",
    storageBucket: "examen2-ux-c80b8.appspot.com",
    messagingSenderId: "579186092674",
    appId: "1:579186092674:web:2f863e07fca936e2bb629b",
    measurementId: "G-SQX3PKBWDP"
};

const firebaseApp = initializeApp(firebaseConfig);

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true
    }
});

async function connect(){
    try{
       await client.connect();
       console.log("Conectado a la base de datos");
    }catch(error){
       console.error("Error al conectar a la base de datos: ", error);
    }
   }

   app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
    connect();
})

app.get('/', (req, res) => {
    res.send('Server is running!');
});

// HTTP CRUD

// 1. Create User in Firebase
app.post('/createUser', async (req, res) => {
    try {
        const user = await auth.createUser({
            email: req.body.email,
            password: req.body.password,
        });
        res.status(200).send({
            resultado: user,
            mensaje: 'User created successfully',
        });
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});

// 2. Login User in Firebase
app.post('/logIn', async (req, res) => {
    const auth = getAuth(firebaseApp);
    signInWithEmailAndPassword(auth, req.body.email, req.body.password)
        .then((response) => {
            res.status(200).send({
                resultado: response,
            });
        })
        .catch((error) => {
            res.status(401).send({
                error: error.message,
            });
        });
});

// 3. Logout User in Firebase
app.post('/logOut', async (req, res) => {
    const auth = getAuth(firebaseApp);
    signOut(auth)
        .then(() => {
            res.status(200).send({
                mensaje: "Session closed",
            });
        })
        .catch((error) => {
            res.status(401).send({
                error: error.message,
            });
        });
});

// 4. Create Post in MongoDB
app.post('/createPost', async (req, res) => {
    try {
        const db = client.db("examen2ux");
        const collection = db.collection("Post");

        const response = await collection.insertOne({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
        });

        res.status(200).send({
            resultado: response,
            mensaje: "Post created successfully",
        });
    } catch (error) {
        res.status(400).send({
            error: error.message,
        });
    }
});



// 5. List posts from MongoDB
app.get('/listPosts', async (req, res) => {
    try {
        const db = client.db("examen2ux");
        const collection = db.collection("Post");

        const response = await collection.find({}).toArray();

        res.status(200).send({
            resultado: response,
            mensaje: "Posts listed successfully",
        });
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});


// 6. Edit Post in MongoDB
app.put('/editPost/:id', async (req, res) => {
    try {
        const db = client.db("examen2ux");
        const collection = db.collection("Post");

        const response = await collection.updateOne(
            {
                _id: new ObjectId(req.params.id)
            },
            {
                $set: {
                    title: req.body.title,
                    content: req.body.content,
                    author: req.body.author,
                }
            }
        );

        res.status(200).send({
            resultado: response,
            mensaje: "Post updated successfully",
        });
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});

// 7. Delete Post in MongoDB
app.delete('/deletePost/:id', async (req, res) => {
    try {
        const db = client.db("examen2ux");
        const collection = db.collection("Post");

        const response = await collection.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (response.deletedCount > 0) {
            res.status(200).send({
                mensaje: "Post deleted successfully",
                resultado: response,
            });
        } else {
            res.status(404).send({
                mensaje: "Post not found",
            });
        }
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});