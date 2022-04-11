const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel');
const { isUserLoaded } = require('../services/auth');
const Course = require('../controllers/Course');

module.exports = function () {
  const router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));
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

  router.post('/course/add/', async (req, res, next) => {
    try {
      const course = {
        prefix: String(req.body.coursePrefix),
        suffix: String(req.body.courseSuffix),
        credits: Number(req.body.courseCredits),
        description: String(req.body.courseDescription),
        title: String(req.body.courseTitle),
      };
      log.info(
        `${req.method} ${req.originalUrl} success: adding course ${course.prefix} ${course.suffix} ${course.title} ${course.description} ${course.credits}`
      );
      await Course.create(req.session.session_token, course);
      log.info(`${req.method} ${req.originalUrl} success: successfully added`);
      res.redirect('/manage');
    } catch (error) {
      next(error);
    }
  });

  return router;
};
