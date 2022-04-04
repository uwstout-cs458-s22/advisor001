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
 
return router;
};

//Reference methods for constructing Add User method.
/*router.get('/users/delete/:userID', async (req, res, next) => {
  try {
    const userID = req.params.userID
    console.log(userID);
    console.log(req.session.session_token);
    const users = await User.deleteUser(req.session.session_token, userID);
    log.info(
      `${req.method} ${req.originalUrl} success: successfully deleted and rerouted`
    );
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

async function deleteUser(sessionToken, userId) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.delete(`users/${userId}`);
  if (response.status === 200) {
    log.debug(`User: ${userId} successfully deleted`);
  } else {
    throw HttpError(500, `Advisor API Delete Error ${response.status}: ${response.data.error.message}`);
  }
}*/

