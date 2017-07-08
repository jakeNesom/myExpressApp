var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var EntryGen = require('../scripts/random-entries.js');
var URL = 'mongodb://localhost:27017/db1'

var bodyParser = require('body-parser');
var cors = require ('cors');
var milliepoch = require ('milli-epoch');
var myEG = new EntryGen(1, 1800000);

var corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});


/* GET users listing. */
router.get('/read/all', function(req, res, next) {
  
  console.log('route /logv/read/all fired');

  MongoClient.connect(URL, function (err, db) {
        assert.equal(null, err);
        // Get the documents collection, using the collection json
        var collection = db.collection('clientLogs');
        
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
  });
});

router.get('/write', cors(corsOptions), function(req, res, next) { 
  
  console.log('route /logv/write fired');
  
  console.dir(req.query);

  if(req.query.create) {
    if(req.query.create === 'true' )
    {
      var clientArr = [];
      for(let i = 0; i < 30; i ++ ) {
        clientArr.push(myEG.createClient());
      }
      

      MongoClient.connect(URL, function (err, db) {
            assert.equal(null, err);
            // Get the documents collection, using the collection json
            var collection = db.collection('clientLogs');

            collection.insertMany(clientArr);
            res.send( JSON.stringify(clientArr) );
            
            db.close();
            
            
      });
    }
  }
  else {
    res.send('create Param not set');
  }

  
  
 
});

router.post('/read/filterget', cors(corsOptions), function (req, res) {

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


    MongoClient.connect(URL, function (err, db) {
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

router.get('/read/getfiltered', function (req, res) {
    
    console.log('Get Filtered Fired: ');
    console.dir(req.query);
    var errDatabase = "Must provide database info";
    if (req.query.database) {

        if (req.query.database == 'clientserverExpSockIO') {
            var url = 'mongodb://localhost:27017/db1';
            console.log('connected');
        }
        else
            var url = 'mongodb://localhost:27017/db1';
        
    }
    else
        res.send(JSON.stringify(errDatabase));


    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('connected');
        var collection = db.collection('clientLogs');
        var start;
        var end;
        if (req.query.startTime && req.query.stopTime) {
            start = parseInt(req.query.startTime);
            end = parseInt(req.query.stopTime);
        }
        else
            if (req.query.startTime) {
                start = parseInt(req.query.startTime);
                end = milliepoch.now();
            }
            else
                if (req.query.stopTime) {
                    start = 0;
                    end = parseInt(req.query.stopTime);
                }
        else {
            start = 0;
            end = milliepoch.now();
            }
        console.dir(start);
        console.dir(end);
        if (req.query.client && req.query.node && req.query.logType) {
            collection.find({ Client: req.query.client, Node: req.query.node, Time: { $gt: start, $lt: end }, LogType: req.query.logType }).toArray(function (err, docs) {
                assert.equal(err, null);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(docs));
                db.close();
            });
        }
        else
            if (req.query.client && req.query.node) {
                collection.find({ Client: req.query.client, Node: req.query.node, Time: { $gt: start, $lt: end } }).toArray(function (err, docs) {
                    assert.equal(err, null);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(docs));
                    db.close();
                });
            }
            else
                if (req.query.client && req.query.logType) {
                    collection.find({ Client: req.query.client, Time: { $gt: start, $lt: end }, LogType: req.query.logType }).toArray(function (err, docs) {
                        assert.equal(err, null);
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(docs));
                        db.close();
                    });
                }
                else
                    if (req.query.node && req.query.logType) {
                        collection.find({ Node: req.query.node, Time: { $gt: start, $lt: end }, LogType: req.query.logType }).toArray(function (err, docs) {
                            assert.equal(err, null);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(docs));
                            db.close();
                        });
                    }
                    else
                        if (req.query.logType) {
                            collection.find({ Time: { $gt: start, $lt: end }, LogType: req.query.logType }).toArray(function (err, docs) {
                                assert.equal(err, null);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(docs));
                                db.close();
                            });
                        }
                        else
                            if (req.query.client) {
                                collection.find({ Client: req.query.client, Time: { $gt: start, $lt: end } }).toArray(function (err, docs) {
                                    assert.equal(err, null);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify(docs));
                                    db.close();
                                });
                            }
                            else
                                if (req.query.node) {
                                    collection.find({ Node: req.query.node, Time: { $gt: start, $lt: end } }).toArray(function (err, docs) {
                                        assert.equal(err, null);
                                        res.setHeader('Content-Type', 'application/json');
                                        res.send(JSON.stringify(docs));
                                        db.close();
                                    });
                                }
                                else {
                                    collection.find({  Time: { $gt: start, $lt: end }}).toArray(function (err, docs) {
                                        assert.equal(err, null);
                                        res.setHeader('Content-Type', 'application/json');
                                        res.send(JSON.stringify(docs));
                                        db.close();
                                    });
                                }
    })

});


router.get('/read/getfiltered/aggregate', cors(corsOptions), function (req, res) {
    var errDatabase = "Must provide database info";
    console.dir(req.query);
    var url = '';
    if (req.query.database) {

        if (req.query.database === 'clientserverExpSockIO') {
            url = 'mongodb://localhost:27017/db1';
            //var url = 'mongodb://localhost:27017/clientserverExpSockIO';
            console.log('connected');
        }
        else if(req.query.database === 'db1') {
             url = 'mongodb://localhost:27017/db1';
        }
        else if(req.query.database === 'NodeDB') {
          url = 'mongodb://localhost:27017/NodeDB';
        }
            

    }
    else {
        res.send(JSON.stringify(errDatabase));
    }
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('connected');
        //var collection = db.collection('json');
        var collection = db.collection('clientLogs');
        var start;
        var end;
        if (req.query.startTime && req.query.stopTime) {
            start = parseInt(req.query.startTime);
            end = parseInt(req.query.stopTime);
            console.log('startTime Set: ' + start);
        }
        else
            if (req.query.startTime) {
                
                start = parseInt(req.query.startTime);
                console.log('startTime Set: ' + start);
                end = milliepoch.now();
            }
            else
                if (req.query.stopTime) {
                    start = 0;
                    end = parseInt(req.query.stopTime);
                }
                else {
                    start = 0;
                    end = milliepoch.now();
                }
        console.dir(start);
        console.dir(end);
        if (req.query.client && req.query.node) {
            collection.aggregate([
                {
                    $match: { Time: { $gt: start, $lt: end }, Client: req.query.client, Node: req.query.node }
                },
                {
                    $group:
                    { _id: "$LogType", total: { $sum: 1 } }
                }
            ], function (err, docs) {
                assert.equal(err, null);
                console.log(docs);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(docs));
                db.close();

            });
        }
        else
        if (req.query.node) {
            collection.aggregate([
                {
                    $match: { Time: { $gt: start, $lt: end }, Node: req.query.node }
                },
                {
                    $group:
                    { _id: "$Client", total: { $sum: 1 } }
                }
            ], function (err, docs) {
                assert.equal(err, null);
                console.log(docs);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(docs));
                db.close();

            });
        }
        else if (req.query.client) {
            collection.aggregate([
                {
                    $match: { Time: { $gt: start, $lt: end }, Client: req.query.client }
                },
                {
                    $group:
                    { _id: "$Node", total: { $sum: 1 } }
                }
            ], function (err, docs) {
                assert.equal(err, null);
                console.log(docs);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(docs));
                db.close();

            });
        }
        else
            {
               console.log('else fired');
                collection.aggregate([
                    {
                        $match: { Time: { $gt: start, $lt: end } }
                    },
                    {
                        $group:
                        { _id: "$" + req.query.groupType, total: { $sum: 1 } }
                    }
                ], function (err, docs) {
                    if(err) console.log(err);
                    assert.equal(err, null);
                    console.log(docs);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(docs));
                    db.close();

                });
            }
        })

 });
module.exports = router;