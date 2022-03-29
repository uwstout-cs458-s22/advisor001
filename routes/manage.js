const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel');
const { isUserLoaded } = require('../services/auth');
const Course = require('../controllers/Course');

// Temporary solution to check if data can be displayed.
const courses = [
  {
    id: 1,
    department: 'CS',
    number: '101',
    credits: 3,
  },
  {
    id: 2,
    department: 'CS',
    number: '102',
    credits: 3,
  },
  {
    id: 3,
    department: 'CS',
    number: '103',
    credits: 3,
  },
];

module.exports = function () {
  const router = express.Router();
  router.use(bodyParser.json());
  router.get('/', isUserLoaded, async (req, res, next) => {
    try {
      // Not recognized as a valid function.
      // const courses = await Course.fetchAllCourses(req.session.session_token, 0, 10000000);
      // fetchOne will likely go unused as we would like to fetch all courses.
      // const courses = await Course.fetchOne(req.session.session_token);
      res.render('layout', {
        pageTitle: 'Advisor Management',
        group: 'manage',
        template: 'index',
        email: req.session.user.email,
        role: req.session.user.role,
        data: courses,
      });
      log.info(`${req.method} ${req.originalUrl} success: rendering manage page with  user(s)`);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
