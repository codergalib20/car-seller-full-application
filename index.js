const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
// Middleware
app.use(cors());
app.use(express.json());
// Connect to database link
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpacy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        const database = client.db('car_seller')
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');

        // Get all products
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        // Get Single Product___________________________________________________________________________
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.json(product);
        })
        // Get Orders Products___________________________________________________________________________
        app.get('/orders', async(req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })
        app.get('/reviews', async(req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })
        // Check user is admin ?_____________________________________________________________________________
        app.get('/users/:email', async (req, res)=> {
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({isAdmin});
        })
        // Add new product_____________________________________________________________________________
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log(result);
            res.json(result)
        })
       
        // Ordered from User_____________________________________________________________________________
        app.post('/orders', async(req, res) => {
                 const order = req.body;
                 const result = await orderCollection.insertOne(order);
                 res.json(result);
        })
        // Add Users Collection or User Info_____________________________________________________________________________
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        })
        // Add User Review_____________________________________________________________________________
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })
        app.put('/users/admin', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        // Update Order Services
        app.put('/orders/:id', async (req , res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const option = {upsert: true};
            const updateDoc = {
                $set : {
                    status : 'Approved'
                },
            };
            const result = await orderCollection.updateOne(query, updateDoc, option)
            res.json(result)
        })
        // Delete Order____________________________________________________________________
        app.delete('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })
        // Delete Product____________________________________________________________________
        app.delete('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);












app.get('/', (req, res) => {
  res.send('Welcome to car sells application!');
});

app.listen(port, () => {
  console.log(`Car sells application ${port}!`);
});