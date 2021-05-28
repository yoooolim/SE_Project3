var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,

  host:'localhost',
  user:'root',
  password: '',
  database:'on_the_board'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);

      connection.query('SELECT * FROM product_tbl ORDER BY sales_amount DESC;', function(err, rows) {
        if(err) console.error("err: "+err);
        console.log("rows : "+JSON.stringify(rows));
        res.render('index', {title: 'test', rows : rows, user: row_user});
        connection.release();

      });
    });
  });
});

router.get('/list',function(req,res,next){
  res.render('productList',{title: "제품 목록"});
});

router.get('/gallery/read/:idx',function(req,res,next){
  res.render('read',{title: "제품 목록"});
});

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
router.get('/order', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    connection.query('select product_tbl.name as product_name, product_tbl.img_url, product_tbl.price, user_tbl.name, user_tbl.address, user_tbl.phone_number, user_tbl.email, product_tbl.id as product_id, user_tbl.id as user_id from product_tbl, user_tbl;', function(err, rows) {
      if(err) console.error("err: "+err);
      console.log("rows : "+JSON.stringify(rows));
      res.render('order', {title: '주문하기', rows : rows});
      connection.release();
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
  var create_date =req.body.date;
  var datas =[user_id, product_id, product_cnt, is_payed, total_money, create_date];
  
  pool.getConnection(function(err, connection) {
    var sqlForInsertOrder = "insert into order_tbl(user_id, product_id, product_cnt, is_payed, total_money, create_date) values (?,?,?,?,?,?)"
    connection.query(sqlForInsertOrder, datas, function(err, rows) {
      if (err) console.error("err: " + err);
      console.log("rows : " + JSON.stringify(rows));

      res.redirect('/order-complete');
      connection.release();
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

//order-complete 화면 표시 GET
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
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('login', {title: '로그인', user:rows });
      connection.release();
      //don't use the connection here
    });
  });
});

//login 로직 처리 POST
router.post('/login', async function(req, res, next){
  var id = req.body.id;
  var password = req.body.password;
  var datas = [id, password];

  pool.getConnection(function(err, connection){
    var sqlForInsertUser_tbl = "SELECT * FROM on_the_board.user_tbl WHERE id=? AND password=?";
    connection.query(sqlForInsertUser_tbl, datas, function(err, rows){
      if(err) console.error("err1 : "+err);
      console.log(rows);
      if(rows == ""){//아이디 없을때
        res.write("<script language=\"javascript\">alert('The ID does not exist or the password is incorrect!')</script>");
        res.write("<script language=\"javascript\">window.location=\"login\"</script>");
      }
      else if(rows[0].customer_kind==2){
        res.write("<script language=\"javascript\">alert('Your ID is currently suspended, please contact the administrator.')</script>");
        res.write("<script language=\"javascript\">window.location=\"login\"</script>");
      }
      else{
        res.cookie("user", id,{ //uer 쿠키이름
          expires: new Date(Date.now() + 900000), //쿠키의 만료 시간을 표준 시간 으로 설정
          httpOnly: true //HTTP 프로토콜만 쿠키 사용 가능
        });
        //console.log(req.cookies.user); //로그인한 아이디 출력
        res.redirect('/login_success');
        connection.release();
      }
      //don't use the connection here. 
    });

  });
});

//login_success 화면 표시 GET
router.get('/login_success', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('login_success', {title: '로그인성공', user:rows });
      res.render('login', {title: '로그인', user:rows });
      connection.release();
      //don't use the connection here
    });
  });
});

//logout 화면 표시 GET
router.get('/logout', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('logout', {title: "로그아웃", user:rows });
      connection.release();
      //don't use the connection here
    });
  });
});

//logout 화면 표시 POST
router.post('/logout', function(req, res, next){
  res.clearCookie("user");
  res.redirect('/logout');
});

//join 화면 표시 GET
router.get('/join', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('join', {title: '회원가입', user:rows});
      connection.release();
      //don't use the connection here
    });
  });
});

//join 회원가입 로직 처리 POST
router.post('/join', function(req, res, next){

  var id = req.body.id;
  var email = req.body.email;
  var password = req.body.password;
  var name = req.body.name;
  var address = req.body.address;
  var phone_number = req.body.phone_number;
  var birthday = req.body.birthday;
  var who = req.body.who;
  var datas = [id, email, password, name, address, phone_number, birthday, who];
  
  pool.getConnection(function(err, connection){
    //Use the connection
    var sqlForInsertUser_tbl = "INSERT INTO user_tbl(id, email, password, name, address, phone_number, birthday, who) values(?,?,?,?,?,?,?,?)";
    connection.query(sqlForInsertUser_tbl, datas, function(err, rows){
      if(err) console.error("err1 : "+err);
      console.log("rows : " +JSON.stringify(rows));

      res.redirect('/join_success');
      connection.release();

      //don't use the connection here. 
    });
  });
});

//join_success 화면 표시 GET
router.get('/join_success', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('join_success', {title: '회원가입성공', user:rows})
      res.render('join', {title: '회원가입', user:rows});
      connection.release();
      //don't use the connection here
    });
  });
});

//mypage 화면 표시 GET
router.get('/mypage', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('mypage', {title: '마이페이지', user:rows});
      connection.release();
      //don't use the connection here
    });
  });
});

//회원정보 화면 표시 GET
router.get('/member', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){

      connection.query('SELECT * FROM user_tbl', function(err, rows){
        if(err) console.error("err : "+err);
  
        res.render('member', {title: '회원관리', rows:rows, user:row_user})
        connection.release();
        //don't use the connection here
      });
    });
  });
});

//장바구니 화면 표시 GET
router.get('/cart', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);

      connection.query('select product_tbl.name as product_name, product_tbl.img_url, product_tbl.price, user_tbl.name, user_tbl.address, user_tbl.phone_number, user_tbl.email, product_tbl.id as product_id, user_tbl.id as user_id from product_tbl, user_tbl;', function(err, rows) {
        if(err) console.error("err: "+err);
        console.log("rows : "+JSON.stringify(rows));
        res.render('cart', {title: '장바구니', rows:rows, user:row_user});
        connection.release();
      });
    });
  });
});

module.exports = router;
