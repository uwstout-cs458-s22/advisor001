const express = require('express');
const log = require('loglevel');
const bodyParser = require('body-parser');
const { isUserLoaded } = require('../services/auth');
const User = require('../controllers/User');
// const app = require('../app');

module.exports = function () {
  const router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded( {extended: true }));
  router.get('/', isUserLoaded, async (req, res, next) => {
    try {
      // In the future it would be helpful to get an amount of all users in the database and replace the hardcoded value.
      const users = await User.fetchAll(req.session.session_token, 0, 10000000);
      res.render('layout', {
        pageTitle: 'Advisor Admin',
        group: 'admin',
        template: 'index',
        email: req.session.user.email,
        data: users,
      });
      log.info(
        `${req.method} ${req.originalUrl} success: rendering admin page with ${users.length} user(s)`
      );
    } catch (error) {
      next(error);
    }
  });

  router.post('/users/edit/:userId', isUserLoaded, async (req, res, next) => {
    let isEnabled = true
    let userRole = req.body.role
    if (req.body.enable === undefined) {
      isEnabled = false
      req.body.enable = false
    }
    if (req.body.role === undefined) {
      userRole = 'user'
      req.body.role = 'user'
    }
    const newValues = {
      enable : isEnabled,
      role: userRole
    }
    try {
      await User.edit(req.session.session_token, req.params.userId, newValues);
      res.redirect(303, '/admin');
    } catch(error) {
      next(error);
    }
  });

  return router;
};
