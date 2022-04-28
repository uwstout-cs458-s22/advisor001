const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel');
const { isUserLoaded } = require('../services/auth');
const Course = require('../controllers/Course');
const Term = require('../controllers/Term');

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
        enable: req.session.user.enable,
        data: courses,
      });
      log.info(
        `${req.method} ${req.originalUrl} success: rendering manage page with ${courses.length} course(s)`
      );
    } catch (error) {
      next(error);
    }
  });

  router.post('/course/add/', isUserLoaded, async (req, res, next) => {
    try {
      const course = {
        prefix: String(req.body.coursePrefix),
        suffix: String(req.body.courseSuffix),
        credits: Number(req.body.courseCredits),
        description: String(req.body.courseDescription),
        title: String(req.body.courseTitle),
      };
      await Course.create(req.session.session_token, course);
      res.redirect(303, '/manage');
    } catch (error) {
      next(error);
    }
  });

  router.post('/course/edit/:id', isUserLoaded, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const course = {
        prefix: String(req.body.editPrefix),
        suffix: String(req.body.editSuffix),
        credits: Number(req.body.editCredits),
        description: String(req.body.editDescription),
        title: String(req.body.editTitle),
      };
      await Course.edit(req.session.session_token, id, course);
      res.redirect(303, '/manage');
    } catch (error) {
      next(error);
    }
  });

  router.get('/course/delete/:id', isUserLoaded, async (req, res, next) => {
    try {
      const id = req.params.id;
      await Course.deleteCourse(req.session.session_token, id);
      res.redirect(303, '/manage');
    } catch (error) {
      next(error);
    }
  });

  router.post('/term/add/', isUserLoaded, async (req, res, next) => {
    try {
      const term = {
        title: String(req.body.termTitle),
        startyear: Number(req.body.termYear),
        semester: Number(req.body.termSemester),
      };
      await Term.create(req.session.session_token, term);
      res.redirect(303, '/manage');
    } catch (error) {
      next(error);
    }
  });

  return router;
};
