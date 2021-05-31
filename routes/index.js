var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/'});
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

/* 유림 리뷰 */
router.get('/reviewwrite/:category1_id/:category2_id/:id',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var id = req.params.id;
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      console.log("row_user : "+JSON.stringify(row_user));
      res.render('review_write',{title: "구매자 후기 작성",category1_id:category1_id, category2_id:category2_id,id:id, user: row_user});
      connection.release();
    });
  });
});

router.post('/reviewwrite/:category1_id/:category2_id/:id',upload.single('img'),function(req,res,next){
  var id = req.params.id;
  var title = req.body.title;
  var context = req.body.context;
  var img = "/"+req.file.filename;
  var user = req.body.user;
  var moment = require('moment');

  require('moment-timezone');
  moment.tz.setDefault("Asia/Seoul");
  
  var time= moment().format('YYYY-MM-DD HH:mm:ss');

  pool.getConnection(function(err,connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      var sqlForSearchReviewNum = "SELECT MAX(id) FROM review_tbl;";
      connection.query(sqlForSearchReviewNum,function(err,rows){
        if(err) console.error("err: "+err);
        var dbid = rows[0].column;
        var datas = [dbid,user,id,title,context,img,time];
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
});

/* 메뉴별 상품 리스트 */
router.get('/gallery/:category1_id/:category2_id&name',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var sortCategory = req.body.sort;
  var defaultC = 1;
  var sort="name";
  var sql = 'SELECT * FROM product_tbl WHERE category1_id=? and category2_id=? ORDER BY '+sort;
  pool.getConnection(function(err,connection){
    var sqluser = 'SELECT * FROM user_tbl WHERE id=?';
    connection.query(sqluser, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      //console.log("row_user : "+JSON.stringify(row_user));
      //console.log(category1_id+" "+category2_id)
      //Use the connection
      connection.query(sql,[category1_id, category2_id], function(err,rows){
        if(err) console.error("err : "+err);
        //console.log("@@rows : "+JSON.stringify(rows));

        res.render('gallery', {title: '게시판 전체 글 조회', rows: rows, user : row_user, defaultC : defaultC});
        connection.release();
      });
    });
  });
});

router.get('/gallery/:category1_id/:category2_id&sales_amount',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var sortCategory = req.body.sort;
  var defaultC = 2;
  var sort="sales_amount";
  var sql = 'SELECT * FROM product_tbl WHERE category1_id=? and category2_id=? ORDER BY '+sort;
  console.log(sortCategory+sql+"ㅎㅎ");
  pool.getConnection(function(err,connection){
    var sqluser = 'SELECT * FROM user_tbl WHERE id=?';
    connection.query(sqluser, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      //console.log("row_user : "+JSON.stringify(row_user));
      //console.log(category1_id+" "+category2_id)
      //Use the connection
      connection.query(sql,[category1_id, category2_id], function(err,rows){
        if(err) console.error("err : "+err);
        console.log("@@rows : "+JSON.stringify(rows));

        res.render('gallery', {title: '게시판 전체 글 조회', rows: rows, user : row_user, defaultC : defaultC});
        connection.release();
      });
    });
  });
});

router.get('/gallery/:category1_id/:category2_id&price',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var sortCategory = req.body.sort;
  var sort="price";
  var defaultC = 3;
  var sql = 'SELECT * FROM product_tbl WHERE category1_id=? and category2_id=? ORDER BY '+sort;
  console.log(sortCategory+sql+"ㅎㅎ");
  pool.getConnection(function(err,connection){
    var sqluser = 'SELECT * FROM user_tbl WHERE id=?';
    connection.query(sqluser, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      //console.log("row_user : "+JSON.stringify(row_user));
      //console.log(category1_id+" "+category2_id)
      //Use the connection
      connection.query(sql,[category1_id, category2_id], function(err,rows){
        if(err) console.error("err : "+err);
        console.log("@@rows : "+JSON.stringify(rows));

        res.render('gallery', {title: '게시판 전체 글 조회', rows: rows, user : row_user, defaultC : defaultC});
        connection.release();
      });
    });
  });
});

router.get('/gallery/:category1_id/:category2_id&priceDESC',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var sortCategory = req.body.sort;
  var sort="price DESC";
  var defaultC = 4;
  var sql = 'SELECT * FROM product_tbl WHERE category1_id=? and category2_id=? ORDER BY '+sort;
  console.log(sortCategory+sql+"ㅎㅎ");
  pool.getConnection(function(err,connection){
    var sqluser = 'SELECT * FROM user_tbl WHERE id=?';
    connection.query(sqluser, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      //console.log("row_user : "+JSON.stringify(row_user));
      //console.log(category1_id+" "+category2_id)
      //Use the connection
      connection.query(sql,[category1_id, category2_id], function(err,rows){
        if(err) console.error("err : "+err);
        //console.log("@@rows : "+JSON.stringify(rows));

        res.render('gallery', {title: '게시판 전체 글 조회', rows: rows, user : row_user, defaultC : defaultC});
        connection.release();
      });
    });
  });
});

router.post('/gallery/:category1_id/:category2_id&priceDESC',function(req,res,next){
  var sortCategory = req.body.sort;
  console.log("in");
  res.redirect('/gallery/:category1_id/:category2_id&'+sortCategory);
});

/*제품 상세 페이지*/
router.get('/gallery/:category1_id/:category2_id/:id',function(req,res,next){
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var id = req.params.id;
  var sql1 = 'SELECT * FROM on_the_board.product_tbl WHERE category1_id=? and category2_id=? and id=?';
  var sql2 = 'SELECT * FROM on_the_board.review_tbl WHERE product_id=?';
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      var sql3 = 'SELECT * FROM like_tbl, product_tbl where like_tbl.product_id = product_tbl.id and like_tbl.user_id = ?;'
      
      connection.query(sql3, req.cookies.user, function(err, rows_like) {
        if(err) console.error("err: "+err);
        
        connection.query(sql1,[category1_id, category2_id,id], function(err,rows){
          if(err) console.error("err : "+err);
    
          connection.query(sql2,[id], function(err,reviewrows){
            if(err) console.error("err : "+err);
            res.render('read', {reviewrows: reviewrows, rows: rows, rows_like:rows_like, user:row_user});
            connection.release();
            console.log("row_user : "+JSON.stringify(row_user));
          });

        });
      });
    });
  });
});

/* 제품 상세 페이지 > 찜 post */
router.post('/gallery/:category1_id/:category2_id/:id', function(req,res,next) {
  var category1_id = req.params.category1_id;
  var category2_id = req.params.category2_id;
  var id = req.params.id;
  var jjim_or_cancel = req.body.jjim_or_cancel;
  var user_id = req.body.user_id;
  var product_id = req.body.product_id;

  var datas =[user_id, product_id];
  //console.log("jjim_or_cancel: " + jjim_or_cancel);
  
  pool.getConnection(function(err, connection) {
    var sql;
    if (jjim_or_cancel == "jjim") {
      sql = "INSERT INTO `like_tbl`(`user_id`,`product_id`) VALUES (?, ?);";
    } else {
      sql = "delete from like_tbl where user_id = ? and product_id = ?;";
    }
    connection.query(sql, datas, function(err, rows) {
      if (err) console.error("err: " + err);
      //console.log("jjim_or_cancel: "+ jjim_or_cancel+ " rows : " + JSON.stringify(rows));
      connection.release();
      res.redirect('/gallery/'+category1_id+'/'+category2_id+'/'+id);
    });
  });
});

/* 주문 화면 표시 */
router.get('/order/:product_id/:product_cnt', function(req, res, next) {
  var product_id = req.params.product_id;
  var product_cnt = req.params.product_cnt;
  
  pool.getConnection(function(err, connection) {
   
    var sql = 'SELECT * FROM user_tbl WHERE id=?';
    var sql1 = 'select * from product_tbl where product_tbl.id = ?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);

      connection.query(sql1, [product_id], function(err, rows){
        if(err) console.error("err: "+err);

        console.log("rows: "+JSON.stringify(rows));
        res.render('order', {rows : rows, user : row_user});
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
  console.log("datas: " + datas);
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
router.get('/order-list-buyer', function(req, res, next) {
  
  pool.getConnection(function(err, connection) {
    var sql1 = 'select order_tbl.id as id, create_date, img_url, name, product_cnt, price, category1_id, category2_id, product_tbl.id as product_id from order_tbl inner join product_tbl on order_tbl.product_id = product_tbl.id where user_id = ? order by order_tbl.create_date desc';
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);

      connection.query(sql1, req.cookies.user, function(err, rows){
        if(err) console.error("err: "+err);
        console.log("rows: "+JSON.stringify(rows));
        
        res.render('order-list-buyer', {rows : rows, user : row_user});
        connection.release();
      });
    });
  });
});

/* 판매 내역 표시 */
router.get('/sales-history-seller', function(req, res, next) {
  var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
  var sql2 = 'SELECT order_tbl.id as id, create_date, category1_tbl.name as category1_name, category2_tbl.name as category2_name, product_tbl.name as name, user_id, product_cnt, total_money FROM order_tbl, product_tbl, category1_tbl, category2_tbl WHERE order_tbl.product_id = product_tbl.id and product_tbl.category1_id = category1_tbl.id and product_tbl.category2_id = category2_tbl.id order by order_tbl.create_date desc;';
  pool.getConnection(function(err, connection) {
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      connection.query(sql2, function(err, rows){
        if(err) console.error("err: "+err);
        //console.log("rows: "+JSON.stringify(rows));
        
        res.render('sales-history-seller', {rows : rows, user : row_user});
        connection.release();
      });
    });
  });
});

/* 상품 주문 현황 */
router.get('/sales-status-seller', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    var sql1 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 1';
    var sql2 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 2';
    var sql3 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 3';
    var sql4 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 4';
    var sql5 = 'select product_tbl.id as id, product_tbl.name as name, product_tbl.price, product_tbl.sales_amount, category2_tbl.name as category2_name from product_tbl, category2_tbl where product_tbl.category2_id = category2_tbl.id and product_tbl.category1_id = 5';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);

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
      
                res.render('sales-status-seller', {rows1 : rows1, rows2 : rows2, rows3 : rows3, rows4 : rows4, rows5 : rows5, user:row_user});
                connection.release();
              });
            });
          });
        });
      });
    });
  });
});

/* 매출 통계 시각화 페이지 */
router.get('/sales-statistics-seller',function(req,res,next){
  pool.getConnection(function(err, connection) {
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      var sql1 = 'select order_tbl.id as id, create_date, product_id, total_money, category1_id from order_tbl, product_tbl  where order_tbl.product_id = product_tbl.id ORDER BY create_date DESC;';
      connection.query(sql1, function(err, rows){
        if(err) console.error("err: "+err);
        console.log("rows: "+JSON.stringify(rows));
          
        res.render('sales-statistics-seller', {rows : rows, user:row_user});
        connection.release();
      });
    });
  });
});

/* 찜한 상품 보기 */
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
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err); 
      connection.query('select * from order_tbl;', function(err, rows) {
        if(err) console.error("err: "+err);
        console.log("rows : "+JSON.stringify(rows));
        res.render('order-complete', {title: '주문하기', rows : rows, user:row_user});
        connection.release();
      });
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
  pool.getConnection(function(err,connection){
    var sqluser = 'SELECT * FROM user_tbl WHERE id=?';
    connection.query(sqluser, req.cookies.user, function(err, row_user){
      res.render('upload',{title: "판매자 물건 업로드", user : row_user});
      connection.release();
    });
  });
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
    var sqlForSearchCategoryNum = "SELECT MAX(id) FROM product_tbl;";
    connection.query(sqlForSearchCategoryNum,function(err,rows){
      if(err) console.error("err: "+err);
      console.log("rows : "+ JSON.stringify(rows));
      var dbid = rows[0].column;
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
});

router.get('/updateproduct', function(req, res, next){
  var id = req.query.id;
  pool.getConnection(function(err, connection){
    //console.log("@@updateproduct"+id)
    var sqluser = 'SELECT * FROM user_tbl WHERE id=?';
    connection.query(sqluser, req.cookies.user, function(err, row_user){
      if(err) console.error("err: "+err);
      var sql = "SELECT * FROM product_tbl WHERE id=?";
      connection.query(sql,[id],function(err,row){
          if(err) console.error(err);
          console.log("update에서 1개 글 조회 결과 확인 : ",row);
          res.render('update', {title: "글 수정", row:row, user : row_user});
          connection.release();
      });
    });
  });
});


router.post('/updateproduct',upload.array('img'),function(req,res,next){
  var product_name = req.body.product_name;
  var price = Number(req.body.product_price);
  var img_url;
  var detail_img_url;
  if(req.files[0]!=null){
    img_url = req.files[0].filename;
  }
  else{
    img_url = req.body.img_url;
  }
  if(req.files[1]!=null){
    detail_img_url=req.files[1].filename;
  }
  else{
    detail_img_url = req.body.detail_img_url;
  }
  var category = req.body.categoryNum;
  var category1_id;
  var category2_id = Number(category);
  if(category<=5) category1_id=1;
  else if(category<=10) category1_id=2;
  else if(category<=15) category1_id=3;
  else if(category<=19) category1_id=4;
  else category1_id=5;
  console.log(price);

  pool.getConnection(function(err,connection){
    var dbid =  req.body.id;
    var dbhit = req.body.hit;
    var datas = [dbid ,product_name ,img_url ,price ,dbhit ,detail_img_url ,category1_id ,category2_id,dbid];
    console.log("@@"+datas);
    var sqlForUpdateProduct = "UPDATE product_tbl SET id=?, name=?, img_url=?, price=?, sales_amount=?, detail_img_url=?, category1_id=?, category2_id=? WHERE id=?";
    connection.query(sqlForUpdateProduct,datas,function(err,rowss){
      if(err) console.error("err: "+err);
      console.log("rows : "+ JSON.stringify(rowss));
      res.redirect('/');
      connection.release();
    });
  });
});


router.post('/deleteproduct', function(req, res, next){
  var id = req.body.id;

  pool.getConnection(function(err,connection){
      var sql = 'DELETE FROM product_tbl WHERE id=?';
      connection.query(sql,[id],function(err,result){
        console.log("~~~"+result+" "+id);
        if(err) console.error("글 삭제 중 에러 발생 err :",err);
        res.redirect('/');
        connection.release();
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
    connection.query(sql, req.cookies.user, function(err, row_user){
      connection.query('SELECT * FROM notice_tbl', function(err, rows){
        if(err) console.error("err: "+err);
        res.render('notice', {title: '공지사항', user:row_user, rows:rows})
        connection.release();
        //don't use the connection here
      });
    });
  });
});

//notice_delete 로직 처리 POST
router.post('/notice_delete/:id', function(req, res, next) {
  var id = req.params.id;
  pool.getConnection(function(err, connection){
    var sql = "DELETE FROM on_the_board.notice_tbl WHERE id=?";
    connection.query(sql, id, function(err, rows){
      if(err) console.log(err);
      res.redirect('/notice');
      console.log("Delete Complete!");
    });
  });
});

//notice 화면 표시 GET
router.get('/notice_page/:id', function(req, res, next){
  var id = req.params.id;

  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, row_user){
      var sqlnotice = 'SELECT * FROM on_the_board.notice_tbl WHERE id=?';
      connection.query(sqlnotice, id, function(err, rows){
        console.log("rows : " +JSON.stringify(rows));
        if(err) console.error("err: "+err);
        res.render('notice_page', {title: '공지사항', user:row_user, rows:rows})
        connection.release();
        //don't use the connection here
      });
    });
  });
});

//notice_update 화면 표시 GET
router.get('/notice_update', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = 'SELECT * FROM on_the_board.user_tbl WHERE id=?';
    connection.query(sql, req.cookies.user, function(err, rows){
      if(err) console.error("err: "+err);
      res.render('notice_update', {title: '공지작성', user:rows});
      connection.release();
      //don't use the connection here
    });
  });
});

//notice_update 로직 처리 POST
router.post('/notice_update', upload.single('image'), function(req, res, next){
  var user_id = req.body.user_id;
  var title = req.body.title;
  var context = req.body.context;
  var create_date = req.body.create_date;
  var image = "/" + req.file.filename;
  var datas = [user_id, title, context, create_date, image];

  console.log("datas : "+datas);
  
  pool.getConnection(function(err, connection){
    //Use the connection
    var sqlForInsertNotice_tbl = "INSERT INTO notice_tbl(user_id, title, context, create_date, image) values(?,?,?,?,?)";
    connection.query(sqlForInsertNotice_tbl, datas, function(err, rows){
      if(err) console.error("err1 : "+err);
      console.log("rows notice : " +JSON.stringify(rows));
      res.redirect('/notice');
      connection.release();

      //don't use the connection here. 
    });
  });
});

module.exports = router;
