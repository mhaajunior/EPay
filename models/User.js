const mongoose = require('mongoose');
const { Schema } = mongoose;

const userShema = new Schema({
  googleId: String,
  name: String,
  email: String,
});

mongoose.model('users', userShema);
