var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/'});
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

/*제품 목록 카테고리1*/
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

/*매출 통계 시각화 페이지*/
router.get('/sales-statistics-seller',function(req,res,next){
  pool.getConnection(function(err, connection) {
    var sql = 'select order_tbl.id as id, create_date, product_id, total_money, category1_id from order_tbl, product_tbl  where order_tbl.product_id = product_tbl.id ORDER BY create_date DESC;';
    
      connection.query(sql, function(err, rows){
        if(err) console.error("err: "+err);
        console.log("rows: "+JSON.stringify(rows));
        
        res.render('sales-statistics-seller', {rows : rows});
        connection.release();
    });
  });
});

/*찜한 상품 보기*/
router.get('/jjim', function(req, res, next){
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      var sql2 = 'SELECT * FROM like_tbl, product_tbl where like_tbl.product_id = product_tbl.id and like_tbl.user_id = ?;'
      connection.query(sql2, req.cookies.user, function(err, rows) {
        if(err) console.error("err: "+err);
        console.log("rows : "+JSON.stringify(rows));
        res.render('jjim', {title: 'test', rows : rows, user: row_user});
        connection.release();

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

//id_delete 로직 처리 POST
router.post('/id_delete/:id', function(req, res, next) {
  var id = req.params.id;
  pool.getConnection(function(err, connection){
    var sql = "DELETE FROM on_the_board.user_tbl WHERE id=?";
    connection.query(sql, id, function(err, rows){
      if(err) console.log(err);
      res.redirect('/member');
      console.log("Delete Complete!");
    });
  });
});

//notice 화면 표시 GET
router.get('/notice', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice', {title: '공지사항', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});

//notice1 화면 표시 GET
router.get('/notice1', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice1', {title: '공지사항1', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});
//notice2 화면 표시 GET
router.get('/notice2', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice2', {title: '공지사항2', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});
//notice3 화면 표시 GET
router.get('/notice3', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice3', {title: '공지사항3', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});
//notice4 화면 표시 GET
router.get('/notice4', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice4', {title: '공지사항4', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});
//notice5 화면 표시 GET
router.get('/notice5', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice5', {title: '공지사항5', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});
//notice6 화면 표시 GET
router.get('/notice6', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice6', {title: '공지사항6', user:rows})
      connection.release();
      //don't use the connection here
    });
  });
});

module.exports = router;
