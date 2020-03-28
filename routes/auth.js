const express = require('express');
const router = express.Router();

const firebase = require('../connections/firebase_client');
const firebaseAdminDb = require('../connections/firebase_admin');
const fireAuth = firebase.auth();

router.get('/signup', function (req, res) {
    res.render('dashboard/signup', {
        title: 'Express',
        error: req.flash('error')

    });
});

router.post('/signup', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    if (password !== confirm_password) {
        req.flash('error', '兩組密碼輸入不符合');
        res.redirect('/auth/signup');
    } else {
        fireAuth.createUserWithEmailAndPassword(email, password)
            .then(function (user) {
                console.log(user);
                var saveUser = {
                    'email': email,
                    'uid': user.user.uid
                }
                firebaseAdminDb.ref('/user/' + user.user.uid).set(saveUser);
                res.redirect('/auth/success');
            })
            .catch(function (error) {
                var errorMessage = error.message;
                console.log(errorMessage);
                req.flash('error', errorMessage);
                res.redirect('/auth/signup');
            })
    }
})

router.get('/success', function (req, res) {
    res.render('dashboard/success', {
        title: '註冊成功'
    });
})

router.get('/signin', function (req, res) {
    res.render('dashboard/signin', {
        title: '登入',
        error: req.flash('error')
    });
})

router.post('/signin', function (req, res) {
    fireAuth.signInWithEmailAndPassword(req.body.email, req.body.password)
        .then(function (user) {
            req.session.uid = user.user.uid;
            res.redirect('/dashboard')
        })
        .catch(function (error) {
            console.log(error);
            var errorMessage = error.message;
            req.flash('error', errorMessage);
            res.redirect('/auth/signin');
        })
})


router.get('/signout', function (req, res) {
    req.session.uid = '';
    res.redirect('/auth/signin');
})

module.exports = router;