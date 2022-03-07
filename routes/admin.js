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
  //Post function for Add User Modal
  router.get('/users/add', isUserLoaded, async (req, res, next) =>{
  try {
    //Copied and pasted from above try-catch.
    //Response: once done, request, grabbing things 
    //Request data from modal
    //Where 0 is will be userID, where 10000000 is will be email.
    //Will have to pass userId and email to get to be able to use them. How to pull out of form/ modal?
    const users = await User.create(req.session.session_token, 0, 10000000);
    ;
    log.info(
      `${req.method} ${req.originalUrl} success: new user(s) info has been entered.`
    );
  } catch (error) {
    next(error);
  }
});
return router;
};
