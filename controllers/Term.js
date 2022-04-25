const axios = require('axios');
const log = require('loglevel');
const { deSerializeTerm } = require('../serializers/Term');
const Term = require('../models/Term');
const HttpError = require('http-errors');

async function create(sessionToken, term) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.post(`term`, term);
  if (response.status === 200 || response.status === 201) {
    const termParms = deSerializeTerm(response.data);
    const terms = new Term(termParms);
    log.debug(
      `Advisor API Success: Created (${response.status}) Term ${terms.id} (${terms.title})`
    );
    return response;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.Error}`);
  }
}

async function deleteTerm(sessionToken, id) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.delete(`term/${id}`);
  if (response.status === 200) {
    log.debug(`Term: ${id} successfully deleted`);
    return response;
  } else {
    throw HttpError(500, `Advisor API Delete Error ${response.status}: ${response.data.Error}`);
  }
}

module.exports = {
  create,
  deleteTerm,
};
