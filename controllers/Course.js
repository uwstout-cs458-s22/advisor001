const axios = require('axios');
const log = require('loglevel');
const { deSerializeCourse } = require('../serializers/Course');
const Course = require('../models/Course');
const HttpError = require('http-errors');

// No support for fetchAll on API side yet
async function fetchAll(sessionToken, offset, limit) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.get(`courses?offset=${offset}&limit=${limit}`);
  if (response.status === 200) {
    const deSerializedData = response.data.map(deSerializeCourse);
    const courses = deSerializedData.map((params) => new Course(params));
    log.debug(
      `Advisor API Success: Retrieved ${courses.length} Course(s) with offset=${offset}, limit=${limit}`
    );
    return courses;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.error.message}`);
  }
}

// Will likely be unused
async function fetchOne(sessionToken) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.get();
  if (response.status === 200) {
    const deSerializedData = deSerializeCourse(response.data);
    const course = new Course(deSerializedData);
    log.debug(`Advisor API Success: Retrieved Course ${course.id} (${course.name})`);
    return course;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.error.message}`);
  }
}

module.exports = {
  fetchAll,
  fetchOne,
};
