var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  password: 'se441129!',
  database: 'on_the_board'
});
//pool : mysal 연결할 때

/* GET home page. */
router.get('/', function(req, res, next) {
  //http://localhost:3000/ 로 접속했을 때
  res.render('index', { title: 'Express' });
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
  })
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
