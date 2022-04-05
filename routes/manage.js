const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel');
const { isUserLoaded } = require('../services/auth');
const Course = require('../controllers/Course');

module.exports = function () {
  const router = express.Router();
  router.use(bodyParser.json());
  router.get('/', isUserLoaded, async (req, res, next) => {
    try {
      const courses = await Course.fetchAll(req.session.session_token, 0, 100);
      res.render('layout', {
        pageTitle: 'Advisor Management',
        group: 'manage',
        template: 'index',
        email: req.session.user.email,
        role: req.session.user.role,
        data: courses,
      });
      log.info(
        `${req.method} ${req.originalUrl} success: rendering manage page with ${courses.length} course(s)`
      );
    } catch (error) {
      next(error);
    }
  });

  router.get('/manage/course/add/:newCourse', async (req, res, next) => {
    try {
      // Find way to get newCourse as an object containing all data from the add course modal
      // Pass newCourse to Course.create
      await Course.create(req.session.session_token, title, description, prefix, suffix, credits);
      log.info(`${req.method} ${req.originalUrl} success: successfully added`);
      res.redirect('/manage');
    } catch (error) {
      next(error);
    }
  });

  return router;
};
