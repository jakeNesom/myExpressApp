//Client-Server communication using Websockets and Node.JS[express,socket.io]

//server.js

var express = require('express');

// For encoded URL - receiving a stringifyd JSON sent via POST URL
var bodyParser = require('body-parser');

var http = require('http');
var io = require('socket.io')(http);
var app = express();

var server = http.createServer(app).listen(3030);

io = io.listen(server);
// https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04
// http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.end('Hello World part 2');
// }).listen(8080, 'APP_PRIVATE_IP_ADDRESS');
// console.log('Server running @ http//APP_PRIVATE_IP_ADDRESS:8080/');




var cors = require('cors');


var path = require("path");

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
// Connection URL, use the project name
var url = 'mongodb://localhost:27017/db1';


app._router;
// npm bodyParser/Express setup https://www.npmjs.com/package/body-parser
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(require('connect').bodyParser());
//var jsonParser = bodyParser.json();

// app.use('/db', router);

app.use(function (req, res, next) {

    // Didn't work:
    // http://stackoverflow.com/questions/24446797/how-to-resolve-cors-ie-same-origin-policy-in-angularjs
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Headers', "Content-Type");


    // Bodyparser to help un-encode a JSON sent via URL POST


    //Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // following line was made in trying to debug /read/getall output - its outputting HTML should be jSON
    //res.setHeader('Content-Type', 'application/json');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//app.use(cors());
//app.options('*', cors()); // pre-flight CORS enabled for all routes
app.set('view engine', 'ejs')



app.get('/write/log', function (req, res) {
    res.sendFile(__dirname + '/socket.html');
});


app.get('/', function (req, res) {
    res.send("Welcome to Logger");
});


app.get('/write/logbatch', function (req, res) {
    res.sendFile(__dirname + '/socket_batch.html');
});

app.get('/read/getall/', function (req, res) {
    //res.send("All the logged entries");

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        //console.log("Connected successfully to server");

        // Get the documents collection, using the collection json
        var collection = db.collection('clientLogs');
        //insert Json object
        //collection.insertOne(data,
        //function (err, result) {
        //   assert.equal(err, null);
        //   console.log("Inserted a document into the collection.");

        // Find some documents
        collection.find({}).toArray(function (err, docs) {
            assert.equal(err, null);

            // old code - this renders collection as HTML page - doesn't work with get Method 
            //res.render('index.ejs', { logs: JSON.stringify(docs) })

            // updated - this outputs colletion as JSON - able to be read by GET method
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(docs) /*, null, '\t'*/);

            // console.log("Found the following records");
            // console.log(docs)
            db.close();
        });
        //db.close();  
        // error where after collection has over 100 entries, it can't be read from - trying solution here:
        // http://stackoverflow.com/questions/39535287/why-mongodb-not-giving-me-more-than-100-documents
    })

});

// Using these instructions
// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters

// POST is setup to receive strict JSON that's not URLENCODED 
app.post('/read/filterget', function (req, res) {

    console.log(req.headers);
    console.dir(req.body);

    //req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // req.body.Property_Name is the syntax for the JSON properties sent by POST
    if (!req.body) return res.sendStatus(400);


    var params;

    if (req.body.data) {

        params = req.body.data;
        console.log('the data ' + JSON.stringify(params));

    } else { console.log("params not set"); }


    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('mongodb connection opened');
        //console.log("Connected successfully to server");

        // Get the documents collection, using the collection json
        var collection = db.collection('clientLogs');
        //insert Json object
        //collection.insertOne(data,
        //function (err, result) {
        //   assert.equal(err, null);
        //   console.log("Inserted a document into the collection.");

        // Find some documents
        if (params.startTime && params.stopTime) {
            console.log("start & stop time set");
            collection.find({ time: { $gt: params.startTime, $lt: params.stopTime } }).toArray(function (err, docs) {
                assert.equal(err, null);

                // old code - this renders collection as HTML page - doesn't work with get Method 
                //res.render('index.ejs', { logs: JSON.stringify(docs) })

                // updated - this outputs colletion as JSON - able to be read by GET method
                res.setHeader('Content-Type', 'application/json');
                console.dir(docs);
               
                res.send( JSON.stringify(docs) );

                // console.log("Found the following records");
                // console.log(docs)
                db.close();
            });
        } else {
            console.log('Start & End time not available');
            collection.find({}).toArray(function (err, docs) {
                assert.equal(err, null);



                // updated - this outputs colletion as JSON - able to be read by GET method
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(docs) /*, null, '\t'*/);

                // console.log("Found the following records");
                // console.log(docs)
                db.close();
            });

        }
    });

});

// all of the routes will be prefixed with /api
//app.use('/api', router);

//app.use(express.static('./public'));
//Specifying the public folder of the server to make the html accesible using the static middleware

// var server = http.createServer(app).listen(3005, 'localhost');

// io = io.listen(server);
/*initializing the websockets communication , server instance has to be sent as the argument */

io.sockets.on("connection", function (socket) {
    /*Associating the callback function to be executed when client visits the page and 
      websocket connection is made */

    var message_to_client = {
        data: "Connection with the server established"
    }
    socket.send(JSON.stringify(message_to_client));
    /*sending data to the client , this triggers a message event at the client side */
    console.log('Socket.io Connection with the client established');
    socket.on("message", function (data) {
        /*This event is triggered at the server side when client sends the data using socket.send() method */
        data = JSON.parse(data);

        //connect to mongoDB
        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("Connected successfully to server");

            // Get the documents collection, using the collection json
            var collection = db.collection('clientLogs');
            //insert Json object
            collection.insertOne(data,
                function (err, result) {
                    assert.equal(err, null);
                    console.log("Inserted a document into the collection.");

                    // Find some documents
                    // collection.find({}).toArray(function (err, docs) {
                    // assert.equal(err, null);
                    // console.log("Found the following records");
                    // console.log(docs)
                    // })
                    db.close();
                })
        })

        console.log(data);
        /*Printing the data */
        var ack_to_client = {
            data: "Server Received the message"
        }
        socket.send(JSON.stringify(ack_to_client));
        /*Sending the Acknowledgement back to the client , this will trigger "message" event on the clients side*/
    });

});

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
