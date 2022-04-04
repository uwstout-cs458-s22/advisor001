function deSerializeCourse(data) {
  return {
    id: data.id,
    prefix: data.prefix,
    suffix: data.suffix,
    title: data.title,
    credits: data.credits,
  };
}

module.exports = {
  deSerializeCourse,
};
