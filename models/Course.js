class Course {
  constructor(params) {
    this.id = params.id;
    this.prefix = params.prefix;
    this.suffix = params.suffix;
    this.credits = params.credits;
    this.title = params.title;
    this.description = params.description;
  }

  // future complex logic functions can go here
}

module.exports = Course;
