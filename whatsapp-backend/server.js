// importing
import  express from "express";
import mongoose from "mongoose";
import Messages from './dbMessages.js';
import Pusher from "pusher";
import cors from 'cors';

// app config
const app = express();
const port = process.env.PORT || 9000;


const pusher = new Pusher({
    appId: "1767755",
    key: "f0eb07eaa1fd94fed412",
    secret: "070a46b36d49c845211f",
    cluster: "eu",
    useTLS: true
  });
  



//middleware
app.use(express.json());
app.use(cors())




// DB config
const mongoDBURL = 'mongodb+srv://mohdayazbhati:Ayaz_200300@cluster0.uy9yrzh.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(mongoDBURL)
         .then(() => {
            console.log('App connected to database');
            app.listen(port, () => console.log(`Listening On localhost:${port}`));

         })
         .catch(() => {
            console.log(error);
         })

         const db = mongoose.connection;

db.once("open", () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        console.log("A Change occured", change);


        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
            {
                name : messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        } else {
            console.log('error triggering Pusher')
        }

    })


})

// ????

//api routes
app.get('/', (req, res) => res.status(200).send('Hello Sachin'));

app.get('/messages/sync', (req, res) => {
    Messages.find()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});


app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage)
        .then(data => {
            res.status(201).send(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});


// listen
