const express = require('express');
const log = require('loglevel');
const bodyParser = require('body-parser');
const { isUserLoaded } = require('../services/auth');
const User = require('../controllers/User');

module.exports = function () {
  const router = express.Router();
  router.use(bodyParser.json());
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

  // Edit user function for Edit User Modal
  router.get('../users/edit/:userID', async (req, res, next) => {
    try {
      const userID = req.params.userID
      const Email = req.params.Email
      console.log(userID);
      console.log(Email);
      console.log(req.session.session_token);
      const editedUser = await User.edit(userID, Email);
      // const users = await User.create(req.session.session_token, userID, Email);
      log.info(
        `${req.method} ${req.originalUrl} success: returning edited user ${editedUser}`
      );
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  });

  return router;
};
