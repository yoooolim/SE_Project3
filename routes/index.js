var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/'});
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,
  host:'localhost',
  user:'root',
  password: '9376174a',
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
  });
});

router.get('/list',function(req,res,next){
  res.render('productList',{title: "제품 목록"});
});

router.get('/gallery/read/:idx',function(req,res,next){
  res.render('read',{title: "제품 목록"});
});

/* 유림 리뷰 */
router.get('/reviewwrite/:category1_id/:category2_id/:id',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var id = req.params.id;

  res.render('review_write',{title: "구매자 후기 작성",category1_id:category1_id, category2_id:category2_id,id:id});
});

router.post('/reviewwrite/:category1_id/:category2_id/:id',upload.single('img'),function(req,res,next){
  var id = req.params.id;
  var title = req.body.title;
  var context = req.body.context;
  var img = "/"+req.file.filename;
  var moment = require('moment');

  require('moment-timezone');
  moment.tz.setDefault("Asia/Seoul");
  
  var time= moment().format('YYYY-MM-DD HH:mm:ss');

  pool.getConnection(function(err,connection){
    var sqlForSearchReviewNum = "Select * from review_tbl";
    connection.query(sqlForSearchReviewNum,function(err,rows){
      if(err) console.error("err: "+err);
      var dbid = rows.length+1;
      var datas = [dbid,"yryr",id,title,context,img,time];
      console.log(datas);

      var sqlForInsertReview = "INSERT INTO review_tbl(id, user_id, product_id, title, context, img_url, create_date) VALUES(?,?,?,?,?,?,?)";
      connection.query(sqlForInsertReview,datas,function(err,rowss){
        if(err) console.error("err: "+err);
        console.log("rows : "+ JSON.stringify(rowss));
        res.redirect('/');
        connection.release();
      });
    });
  });  
});

router.get('/gallery/:category1_id/:category2_id',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var sql = 'SELECT * FROM product_tbl WHERE category1_id=? and category2_id=?';
  pool.getConnection(function(err,connection){
    //console.log(category1_id+" "+category2_id)
    //Use the connection
    connection.query(sql,[category1_id, category2_id], function(err,rows){
      if(err) console.error("err : "+err);
      console.log("rows : "+JSON.stringify(rows));
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

/*유림*/
router.get('/upload',function(req,res,next){
  res.render('upload',{title: "판매자 물건 업로드"});
});

router.post('/upload',upload.array('img'),function(req,res,next){
  var product_name = req.body.product_name;
  var price = Number(req.body.product_price);
  var img_url = req.files[0].filename;
  var detail_url=req.files[1].filename;
  var category = req.body.categoryNum;
  var category1_id;
  var category2_id = Number(category);
  if(category<=5) category1_id=1;
  else if(category<=10) category1_id=2;
  else if(category<=15) category1_id=3;
  else if(category<=19) category1_id=4;
  else category1_id=5;
  console.log(category+"\n"+category1_id+"\n"+category2_id);

  pool.getConnection(function(err,connection){
    var sqlForSearchCategoryNum = "Select * from product_tbl";
    connection.query(sqlForSearchCategoryNum,function(err,rows){
      if(err) console.error("err: "+err);
      console.log("rows : "+ JSON.stringify(rows));
      var dbid = rows.length+1;
      var datas = [dbid ,product_name ,img_url ,price ,0 ,detail_url ,category1_id ,category2_id];
      console.log(datas);
      var sqlForInsertProduct = "INSERT INTO product_tbl(id, name, img_url, price, sales_amount, detail_img_url, category1_id, category2_id) VALUES(?,?,?,?,?,?,?,?)";
      connection.query(sqlForInsertProduct,datas,function(err,rowss){
        if(err) console.error("err: "+err);
        console.log("rows : "+ JSON.stringify(rowss));
        res.redirect('/');
        connection.release();
      });
    });
  });
})

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

