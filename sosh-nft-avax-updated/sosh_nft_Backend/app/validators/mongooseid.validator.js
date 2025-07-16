const { isValidObjectId } = require('mongoose');
const { ObjectId } = require('mongoose').Types;

module.exports = function (id) {
  console.log('check is valid', isValidObjectId(id));
  if (isValidObjectId(id)) {
    if (new ObjectId(id).toString() === id) {
      return true;
    }
    return false;
  }
  return false;
};
