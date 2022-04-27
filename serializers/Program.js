function deSerializeProgram(data) {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
    };
  }
  
  module.exports = {
    deSerializeProgram,
  };