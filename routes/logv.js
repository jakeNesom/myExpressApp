var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var url = 'mongodb://localhost:27017/db1'


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
  res.send('hello logv/write/  route 2');
  console.log('route /logv/write fired');
});
module.exports = router;