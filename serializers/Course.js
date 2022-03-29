function deSerializeCourse(data) {
  return {
    id: data.id,
    department: data.department,
    number: data.number,
    credits: data.credits,
  };
}

module.exports = {
  deSerializeCourse,
};
