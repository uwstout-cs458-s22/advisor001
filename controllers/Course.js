const axios = require('axios');
const log = require('loglevel');
const { deSerializeCourse } = require('../serializers/Course');
const Course = require('../models/Course');
const HttpError = require('http-errors');

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

async function deleteCourse(sessionToken, id) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.delete(`course/${id}`);
  if (response.status === 200) {
    log.debug(`Course: ${id} successfully deleted`);
    return response;
  } else {
    throw HttpError(500, `Advisor API Delete Error ${response.status}: ${response.data.Error}`);
  }
}

module.exports = {
  fetchAll,
  deleteCourse,
};
