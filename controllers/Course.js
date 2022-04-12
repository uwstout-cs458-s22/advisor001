const axios = require('axios');
const log = require('loglevel');
const { deSerializeCourse } = require('../serializers/Course');
const Course = require('../models/Course');
const HttpError = require('http-errors');

async function create(sessionToken, course) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.post(`course`, course);
  if (response.status === 200 || response.status === 201) {
    const courseParms = deSerializeCourse(response.data);
    const courses = new Course(courseParms);
    log.debug(
      `Advisor API Success: Created (${response.status}) Course ${courses.id} (${courses.courseName})`
    );
    return response;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.Error}`);
  }
}

async function fetchAll(sessionToken, offset, limit) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.get(`course?limit=${limit}&offset=${offset}`);
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

module.exports = {
  fetchAll,
  create,
};
