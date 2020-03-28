const express = require('express');
const router = express.Router();
const striptags = require('striptags');
const convertPaginations = require('../modules/convertPagination');
const moment = require('moment');

const firebaseAdminDb = require('../connections/firebase_admin');

const articlesRef = firebaseAdminDb.ref('article');
const categoriesRef = firebaseAdminDb.ref('categories');


/* GET home page. */
router.get('/', function (req, res, next) {
  let currentPage = Number.parseInt(req.query.page) || 1;
  const status = 'public';
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
    /* 分頁 */
    const data = convertPaginations(articles, currentPage);
    res.render('index', {
      url: '/?',
      articles: data.data,
      categories,
      striptags,
      moment,
      status,
      page: data.page
    });
  });
});


router.get('/post/:id', (req, res, next) => {
  const id = req.param('id');
  let categories = {};
  categoriesRef.once('value').then(function (snapshot) {
    categories = snapshot.val();
    return articlesRef.child(id).once('value');
  }).then(function (snapshot) {
    const article = snapshot.val();
    if (!article) {
      return res.render('error', {
        title: '無此文章'
      })
    }
    res.render('post', {
      title: snapshot.val().title,
      categories,
      article,
      moment,
      striptags
    });
  });
});







module.exports = router;