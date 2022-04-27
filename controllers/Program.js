const axios = require('axios');
const log = require('loglevel');
const { deSerializeProgram } = require('../serializers/Program');
const Program = require('../models/Program');
const HttpError = require('http-errors');

async function deleteProgram(sessionToken, id) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.delete(`program/${id}`);
  if (response.status === 200) {
    log.debug(`Program: ${id} successfully deleted`);
    return response;
  } else {
    throw HttpError(500, `Advisor API Delete Error ${response.status}: ${response.data.Error}`);
  }
}

module.exports = {
  deleteProgram,
};