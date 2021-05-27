var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,

  host:'localhost',
  user:'root',
  password: 'anffl!!8623',
  database:'on_the_board'
});

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

router.get('/list',function(req,res,next){
  res.render('productList',{title: "제품 목록"});
});

/*제품 목록 카테고리1*/
router.get('/gallery/read/:idx',function(req,res,next){
  res.render('read',{title: "제품 목록"});
});

/*제품 목록 카테고리1*/
router.get('/gallery/:category1_id/:category2_id',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var sql = 'SELECT * FROM on_the_board.product_tbl WHERE category1_id=? and category2_id=?';
  pool.getConnection(function(err,connection){
    //Use the connection
    connection.query(sql,[category1_id, category2_id], function(err,rows){
      if(err) console.error("err : "+err);
      //console.log("rows : "+JSON.stringify(rows));

      res.render('gallery', {title: '게시판 전체 글 조회', rows: rows});
      connection.release();
    });
  });
});

/*제품 상세 페이지*/
router.get('/gallery/:category1_id/:category2_id/:id',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var id = req.params.id;
  var sql = 'SELECT * FROM on_the_board.product_tbl WHERE category1_id=? and category2_id=? and id=?';
  var sql2 = 'SELECT * FROM on_the_board.review_tbl WHERE product_id=?';
  pool.getConnection(function(err,connection){
    //Use the connection
    connection.query(sql,[category1_id, category2_id,id], function(err,rows){
      if(err) console.error("err : "+err);
      //console.log("rows : "+JSON.stringify(rows));

      connection.query(sql2,[id], function(err,reviewrows){
        if(err) console.error("err : "+err);
        //console.log("rows : "+JSON.stringify(reviewrows));
        //console.log(reviewrows[0].img_url);
        res.render('read', {reviewrows: reviewrows, rows: rows});
        connection.release();
      });
    });
  });
});

/* 주문 화면 표시 */
router.get('/order/:product_id/:product_cnt', function(req, res, next) {
  var product_id = req.params.product_id;
  var product_cnt = req.params.product_cnt;
  pool.getConnection(function(err, connection) {
    var sql = 'select * from product_tbl where product_tbl.id = ?';
    var sql2 = 'select * from user_tbl';
      connection.query(sql, [product_id], function(err, rows){
        if(err) console.error("err: "+err);
        console.log("rows: "+JSON.stringify(rows));

        connection.query(sql2, function(err, rows2){
          if(err) console.error("err : "+err);
          console.log("rows2: "+JSON.stringify(rows2));
          res.render('order', {rows : rows, rows2 : rows2});
          connection.release();
        });
    });
  });
});

/* 주문 로직*/
router.post('/order', function(req, res, next) {
  var user_id = req.body.user_id;
  var product_id = req.body.product_id;
  var product_cnt = req.body.product_cnt;
  var is_payed = 1;
  var total_money = req.body.total_money;
  var now_date = new Date();
  var create_date = now_date.getFullYear() + '-' + 
                    (now_date.getMonth()+1) + '-' +
                    now_date.getDate() + ' ' +
                    now_date.getHours() + ':' +
                    now_date.getMinutes() + ':' + 
                    now_date.getSeconds();
  
  var datas =[user_id, product_id, product_cnt, is_payed, total_money, create_date];
  //console.log("datas: " + datas);
  pool.getConnection(function(err, connection) {
    var sql1 = "insert into order_tbl(user_id, product_id, product_cnt, is_payed, total_money, create_date) values (?,?,?,?,?,?)"
    var sql2 = "update product_tbl set sales_amount = sales_amount + 1 where id = ?"
    connection.query(sql1, datas, function(err, rows) {
      if (err) console.error("err: " + err);
      console.log("rows : " + JSON.stringify(rows));

      connection.query(sql2, [product_id], function(err, rows2) {
        if (err) console.error("err: " + err);
        console.log("rows2 : " + JSON.stringify(rows2));
        res.redirect('/order-complete');
        connection.release();
      });
    });
  });
});

/* 주문 내역 표시 */
router.get('/order-list-buyer/:user_id', function(req, res, next) {
  var user_id = req.params.user_id;
  pool.getConnection(function(err, connection) {
    var sql = 'select order_tbl.id as id, create_date, img_url, name, product_cnt, price, category1_id, category2_id, product_tbl.id as product_id from order_tbl inner join product_tbl on order_tbl.product_id = product_tbl.id where user_id = ?';
    
      connection.query(sql, [user_id], function(err, rows){
        if(err) console.error("err: "+err);
        console.log("rows: "+JSON.stringify(rows));
        
        res.render('order-list-buyer', {rows : rows});
        connection.release();
    });
  });
});

/* 판매 내역 표시 */
router.get('/sales-history-seller', function(req, res, next) {
  var user_id = req.params.user_id;
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT order_tbl.id as id, create_date, category1_tbl.name as category1_name, category2_tbl.name as category2_name, product_tbl.name as name, user_id, product_cnt, total_money FROM order_tbl, product_tbl, category1_tbl, category2_tbl WHERE order_tbl.product_id = product_tbl.id and product_tbl.category1_id = category1_tbl.id and product_tbl.category2_id = category2_tbl.id;';
    
      connection.query(sql, function(err, rows){
        if(err) console.error("err: "+err);
        console.log("rows: "+JSON.stringify(rows));
        
        res.render('sales-history-seller', {rows : rows});
        connection.release();
    });
  });
});

/* 상품 주문 현황 */
router.get('/sales-status-seller', function(req, res, next) {
  var user_id = req.params.user_id;
  pool.getConnection(function(err, connection) {
    var sql1 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 1';
    var sql2 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 2';
    var sql3 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 3';
    var sql4 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 4';
    var sql5 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 5';
      connection.query(sql1, function(err, rows1){
        if(err) console.error("err: "+err);
        console.log("rows1: "+JSON.stringify(rows1));

        connection.query(sql2, function(err, rows2){
          if(err) console.error("err: "+err);
          console.log("rows2: "+JSON.stringify(rows2));

          connection.query(sql3, function(err, rows3){
            if(err) console.error("err: "+err);
            console.log("rows3: "+JSON.stringify(rows3));
  
            connection.query(sql4, function(err, rows4){
              if(err) console.error("err: "+err);
              console.log("rows4: "+JSON.stringify(rows4));
    
              connection.query(sql5, function(err, rows5){
                if(err) console.error("err: "+err);
                console.log("rows5: "+JSON.stringify(rows5));
      
                res.render('sales-status-seller', {rows1 : rows1, rows2 : rows2, rows3 : rows3, rows4 : rows4, rows5 : rows5});
                connection.release();
              });
            });
          });
        });
    });
  });
});

router.get('/full-width',function(req,res,next){
  res.render('full-width',{title: "full width 실험"});
});

router.get('/sidebar-left',function(req,res,next){
  res.render('sidebar-left',{title: "sidebar-left 실험"});
});

router.get('/sidebar-right',function(req,res,next){
  res.render('sidebar-right',{title: "sidebar-right 실험"});
});

router.get('/basic-grid',function(req,res,next){
  res.render('basic-grid',{title: "basic-grid 실험"});
});

router.get('/font-icons',function(req,res,next){
  res.render('font-icons',{title: "font-icons 실험"});
});
router.get('/order-complete', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    connection.query('select * from order_tbl;', function(err, rows) {
      if(err) console.error("err: "+err);
      console.log("rows : "+JSON.stringify(rows));
      res.render('order-complete', {title: '주문하기', rows : rows});
      connection.release();
    });
  });
});

//login 화면 표시 GET
router.get('/login', function(req, res, next){
  res.render('login', {title: "로그인"});
});

//login 로직 처리 POST
router.post('/login', async function(req, res, next){
  var id = req.body.id;
  var passwd = req.body.pw;
  var sql = 'SELECT * FROM user_tbl WHERE id=?'
  var datas = [id];

  connection.query(sql ,[id], function(err, results){
    if(err){
      console.log('err : ' + err);
    }else{
      if(results.length === 0){
        res.json({success: false, msg: '존재하지 않는 아이디입니다.'})
      }
      else{
        if(!bcrypt.compareSync(password, results[0].passwd)){
          res.json({success:false, msg: '비밀번호가 일치하지 않습니다.'})
        }
        else{
          res.json({success: true})
        }
      }
    }
  });
});

//join 화면 표시 GET
router.get('/join', function(req, res, next){
  res.render('join', {title: "회원가입"});
});

//join_success 화면 표시 GET
router.get('/join_success', function(req, res, next){
  res.render('join_success', {title: "회원가입"});
});

//join 회원가입 로직 처리 POST
router.post('/join', function(req, res, next){
  var id = req.body.id;
  var email = req.body.email;
  var password = req.body.passwd;
  var name = req.body.name;
  var address = req.body.address;
  var phone_number = req.body.phoneNo;
  var birthday = req.body.birth;
  var who = req.body.who;
  var datas = [id, email, password, name, phone_number, birthday, who];
  
  pool.getConnection(function(err, connection){
    //Use the connection
    var sqlForInsertUser_tbl = "INSERT INTO user_tbl(id, email, password, name, phone_number, birthday, who) values(?,?,?,?,?,?,?)";
    connection.query(sqlForInsertUser_tbl,datas, function(err, rows){
      if(err) console.error("err1 : "+err);
      console.log("rows : " +JSON.stringify(rows));

      res.redirect('/join_success');
      connection.release();

      //don't use the connection here. 
    });
  });
});

//mypage 화면 표시 GET
router.get('/mypage', function(req, res, next){
  pool.getConnection(function(err, connection){
    connection.query('SELECT * FROM user_tbl', function(err, rows){
      if(err) console.error("err 1 : "+err);
      console.log("rows : " +JSON.stringify(rows));

      res.render('mypage', {title: '마이페이지', rows: rows});
      connection.release();
      //don't use the connection here
    });
  });
});

module.exports = router;