class Course {
  constructor(params) {
    this.id = params.id;
    this.department = params.department;
    this.number = params.number;
    this.credits = params.credits;
    this.desc = params.desc;
  }

  // future complex logic functions can go here
}

module.exports = Course;
