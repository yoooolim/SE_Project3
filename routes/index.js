var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,
  host:'localhost',
  user:'root',
  password: 'anffl!!8623',
  database:'on_the_board'
})

/* GET home page. */
router.get('/', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM product_tbl ORDER BY sales_amount DESC;', function(err, rows) {
      if(err) console.error("err: "+err);
      console.log("rows : "+JSON.stringify(rows));

      res.render('index', {title: 'test', rows : rows});
      connection.release();
    });
  })
});

module.exports = router;

