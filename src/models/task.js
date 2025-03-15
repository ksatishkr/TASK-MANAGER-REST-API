const mongoose = require('mongoose')
const taskSchema = mongoose.Schema({
  description: {
    type: String,
    trime: true,
    required: true,
  },
  completed: {
    type: Boolean,
    trime: true,
    default: false,
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  }
},{
  timestamps:true
})
const Task = mongoose.model("Task", taskSchema);
module.exports = Task