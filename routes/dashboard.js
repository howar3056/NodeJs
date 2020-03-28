var express = require('express');
var router = express.Router();
var striptags = require('striptags');
var moment = require('moment');
const convertPaginations = require('../modules/convertPagination');

var firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('article');

/* GET users listing. */
router.get('/', function (req, res, next) {
  var auth = req.session.uid;
  res.render('dashboard/dashboard', {
    auth
  });
});

router.get('/article/create', function (req, res, next) {
  categoriesRef.once('value').then(function (snapshot) {
    const categories = snapshot.val();
    console.log('categories', categories);
    res.render('dashboard/article', {
      title: '新增文章',
      categories
    });
  });
});

/* 顯示文章編輯畫面 */
router.get('/article/:id', function (req, res, next) {
  const id = req.param('id');
  let categories = {};
  categoriesRef.once('value').then(function (snapshot) {
    categories = snapshot.val();
    return articlesRef.child(id).once('value');
  }).then(function (snapshot) {
    const article = snapshot.val();
    res.render('dashboard/article', {
      title: 'express',
      categories,
      article
    });
  });
});

/* 新增文章 */
router.post('/article/create', function (req, res) {
  const data = req.body;
  const articleRef = articlesRef.push();
  const key = articleRef.key;
  const updateTime = Math.floor(Date.now() / 1000);
  data.id = key;
  data.update_time = updateTime;
  console.log(data);
  articleRef.set(data).then(function () {
    res.redirect(`/dashboard/article/${key}`);
  });
});

/* 更新文章內容 */
router.post('/article/update/:id', function (req, res) {
  const data = req.body;
  const id = req.param('id');
  const updateTime = Math.floor(Date.now() / 1000);
  data.update_time = updateTime;
  articlesRef.child(id).update(data).then(function () {
    res.redirect(`/dashboard/article/${id}`);
  })
});

/* 顯示文章列表 */
router.get('/archives', function (req, res, next) {
  var auth = req.session.uid;
  let currentPage = Number.parseInt(req.query.page) || 1;
  const status = req.query.status || 'public';
  let categories = {};
  categoriesRef.once('value').then(function (snapshot) {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then(function (snapshot) {
    const articles = [];
    snapshot.forEach(function (snapshotChild) {
      if (status === snapshotChild.val().status) {
        articles.push(snapshotChild.val());
      }
    });
    articles.reverse();
    /* 分頁按鈕 */
    const data = convertPaginations(articles, currentPage);

    const url = '/dashboard/archives?status=' + status + '&';
    res.render('dashboard/archives', {
      url,
      articles: data.data,
      categories,
      striptags,
      moment,
      status,
      page: data.page,
      auth
    });
  });
});

/* 刪除文章 */
router.post('/article/remove', function (req, res) {
  const id = req.body.id;
  articlesRef.child(id).remove();
  res.send({
    "success": true,
    "message": "資料刪除成功"
  });
  res.end();
});

/* 文章分類編輯頁面 */
router.get('/categories', function (req, res, next) {
  const messages = req.flash('info');
  categoriesRef.once('value').then(function (snapshot) {
    const categories = snapshot.val();
    res.render('dashboard/categories', {
      title: 'Express',
      messages,
      hasInfo: messages.length > 0,
      categories
    });
  });
});

/* 新增文章分類 */
router.post('/categories/create', function (req, res) {
  var data = req.body;
  console.log(data);

  var ref = categoriesRef.push();
  var key = ref.key;
  data.id = key;

  categoriesRef.orderByChild('path').equalTo(data.path).once('value')
    .then(function (snapshot) {
      if (snapshot.val() !== null) {
        req.flash('info', '已存在相同路徑');
        res.redirect('/dashboard/categories');
      } else {
        ref.set(data)
          .then(function () {
            res.redirect('/dashboard/categories');
          })
      }
    });
});

/* 刪除文章分類 */
router.post('/categories/remove/:id', function (req, res) {
  const id = req.param('id');
  console.log(id);
  categoriesRef.child(id).remove();
  req.flash('info', '欄位已刪除');
  res.redirect('/dashboard/categories');
});

module.exports = router;