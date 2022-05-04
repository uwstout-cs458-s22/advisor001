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
async function create(sessionToken, program) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.post(`program`, program);
  if (response.status === 200 || response.status === 201) {
    const programParms = deSerializeProgram(response.data);
    const programs = new Program(programParms);
    log.debug(
      `Advisor API Success: Created (${response.status}) Program ${programs.id} (${programs.title})`
    );
    return response;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.Error}`);
  }
}

async function edit(sessionToken, id, program) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.put(`program/${id}`, program);
  if (response.status === 200 || response.status === 201) {
    const programParms = deSerializeProgram(response.data);
    const programs = new Program(programParms);
    log.debug(
      `Advisor API Success: Edited (${response.status}) Program ${program.id} (${programs.title})`
    );
    return response;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.error.message}`);
  }
}

async function fetchAll(sessionToken, offset, limit) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.get(`program?limit=${limit}&offset=${offset}`);
  if (response.status === 200) {
    const deSerializedData = response.data.map(deSerializeProgram);
    const programs = deSerializedData.map((params) => new Program(params));
    log.debug(
      `Advisor API Success: Retrieved ${programs.length} Programs(s) with offset=${offset}, limit=${limit}`
    );
    return programs;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.error.message}`);
  }
}

module.exports = {
  create,
  edit,
  fetchAll,
  deleteProgram,
};
