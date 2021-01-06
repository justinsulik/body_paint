const mongoose = require( 'mongoose' );

const taskSchema = new mongoose.Schema({
  participant_id: String,
  study_name: String,
  browser: mongoose.Schema.Types.Mixed,
  created: { type: Date, default: Date.now },
});

let Task = module.exports = mongoose.model('Task', taskSchema);
