var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var EntryGen = require('../scripts/random-entries.js');
var url = 'mongodb://localhost:27017/db1'

var bodyParser = require('body-parser');
var cors = require ('cors');

var myEG = new EntryGen(1, 1800000);


/* GET users listing. */
router.get('/read/all', function(req, res, next) {
  
  console.log('route /logv/read/all fired');

  MongoClient.connect(url, function (err, db) {
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

router.get('/write', function(req, res, next) { 
  
  console.log('route /logv/write fired');
  
  if(req.query) console.dir(req.query);

  if(req.query.create && req.query.create === 'true') {
    var clientArr = [];
    for(let i = 0; i < 30; i ++ ) {
      clientArr.push(myEG.createClient());
    }
    

    MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          // Get the documents collection, using the collection json
          var collection = db.collection('clientLogs');

          collection.insertMany(clientArr);
          db.close();
          
    });
  }
  else {
    res.send('hello logv/write/  route 2');
  }

  
  
 
});


router.get('/read/getfiltered/aggregate', function (req, res) {
    var errDatabase = "Must provide database info";
    console.dir(req.query);
    if (req.query.database) {

        if (req.query.database == 'clientserverExpSockIO') {
            var url = 'mongodb://localhost:27017/clientserverExpSockIO';
            console.log('connected');
        }
        else
            var url = 'mongodb://localhost:27017/NodeDB';

    }
    else
        res.send(JSON.stringify(errDatabase));

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('connected');
        var collection = db.collection('json');
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
        if (req.query.client) {
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
                collection.aggregate([
                    {
                        $match: { Time: { $gt: start, $lt: end } }
                    },
                    {
                        $group:
                        { _id: "$" + req.query.groupType, total: { $sum: 1 } }
                    }
                ], function (err, docs) {
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