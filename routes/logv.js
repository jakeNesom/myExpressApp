var express = require('express');
var router = express.Router();


var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/logv', function(req, res, next) {
  res.send('respond with a resource');
  console.log('route /logv fired');
});

module.exports = router;