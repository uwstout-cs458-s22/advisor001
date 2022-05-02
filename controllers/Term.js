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

async function edit(sessionToken, id, term) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.put(`term/${id}`, term);
  if (response.status === 200) {
    const termParms = deSerializeTerm(response.data);
    const terms = new Term(termParms);
    log.debug(`Advisor API Success: Edited (${response.status}) Term ${terms.id} (${terms.title})`);
    return response;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.Error}`);
  }
}

async function fetchAll(sessionToken, offset, limit) {
  const request = axios.create({
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  const response = await request.get(`term?limit=${limit}&offset=${offset}`);
  if (response.status === 200) {
    const deSerializedData = response.data.map(deSerializeTerm);
    const terms = deSerializedData.map((params) => new Term(params));
    log.debug(
      `Advisor API Success: Retrieved ${terms.length} Term(s) with offset=${offset}, limit=${limit}`
    );
    return terms;
  } else {
    throw HttpError(500, `Advisor API Error ${response.status}: ${response.data.error.message}`);
  }
}

module.exports = {
  create,
  edit,
  fetchAll,
};
