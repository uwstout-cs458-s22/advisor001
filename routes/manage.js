const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel');
const { isUserLoaded } = require('../services/auth');
const Course = require('../controllers/Course');
const Term = require('../controllers/Term');
// const Program = require('../controllers/Program'); // ADD IN WHEN API

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

  router.post('/course/add/', async (req, res, next) => {
    try {
      const course = {
        prefix: String(req.body.coursePrefix),
        suffix: String(req.body.courseSuffix),
        credits: Number(req.body.courseCredits),
        description: String(req.body.courseDescription),
        title: String(req.body.courseTitle),
      };
      await Course.create(req.session.session_token, course);
      res.redirect('/manage');
    } catch (error) {
      next(error);
    }
  });

  router.post('/course/edit/:id', async (req, res, next) => {
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
      res.redirect('/manage');
    } catch (error) {
      next(error);
    }
  });

  router.get('/course/delete/:id', async (req, res, next) => {
    try {
      const id = req.params.id;
      await Course.deleteCourse(req.session.session_token, id);
      res.redirect('/manage');
    } catch (error) {
      next(error);
    }
  });

  router.post('/term/add/', async (req, res, next) => {
    try {
      const term = {
        title: String(req.body.termTitle),
        startyear: Number(req.body.termYear),
        semester: Number(req.body.termSemester),
      };
      await Term.create(req.session.session_token, term);
      res.redirect('/manage');
    } catch (error) {
      next(error);
    }
  });

  router.get('/program/edit/:id', async (req, res, next) => { // MAKE POST ?
    try {
      // const id = Number(req.params.id);
      // const program = { // CHANGE TO PROGRAM INPUTS
      //   title: 'I hope this works',
      //   startyear: 2040,
      //   semester: 2,
      // };
      // await Program.edit(req.session.session_token, id, program);
      res.redirect('/manage');
    } catch (error) {
      log.debug(error);
      next(error);
    }
  });

  return router;
};
