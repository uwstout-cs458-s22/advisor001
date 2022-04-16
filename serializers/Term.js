function deSerializeTerm(data) {
  return {
    id: data.id,
    title: data.title,
    startyear: data.startyear,
    semester: data.semester,
  };
}

module.exports = {
  deSerializeTerm,
};
