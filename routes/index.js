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

/* 주문 화면 표시 */
router.get('/order', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    connection.query('select product_tbl.name, product_tbl.img_url, product_tbl.price, user_tbl.name from product_tbl, user_tbl;', function(err, rows) {
      if(err) console.error("err: "+err);
      console.log("rows : "+JSON.stringify(rows));
      res.render('order', {title: '주문하기', rows : rows});
      connection.release();
    });
    
  });
});

module.exports = router;

