const mongoose = require( 'mongoose' );

const responseSchema = new mongoose.Schema({
  participant_id: String,
  study_name: String,
  trial_data: {},
  date: { type: Date, default: Date.now },
});

let Response = module.exports = mongoose.model('Response', responseSchema);
