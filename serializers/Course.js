function deSerializeCourse(data) {
  return {
    id: data.id,
    department: data.prefix,
    number: data.suffix,
    desc: data.title,
    credits: data.credits,
  };
}

module.exports = {
  deSerializeCourse,
};
