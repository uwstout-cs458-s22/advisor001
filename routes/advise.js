const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel');
const { isUserLoaded } = require('../services/auth');

module.exports = function () {
  const router = express.Router();
  router.use(bodyParser.json());
  router.get('/', isUserLoaded, async (req, res) => {
    if(req.session.user.enable) {
      res.render('layout', {
        pageTitle: 'Advisor',
        group: 'advise',
        template: 'index',
        email: req.session.user.email,
        role: req.session.user.role,
        enable: req.session.user.enable,
      });
      log.info(`${req.method} ${req.originalUrl} success: rendering advisement page`);
    } else {
      res.render('layout', {
        pageTitle: 'Access Denied',
        group: 'accessDenied',
        template: 'index',
        email: req.session.user.email,
        role: req.session.user.role,
        enable: req.session.user.enable,
      });
    }
  });

  return router;
};
