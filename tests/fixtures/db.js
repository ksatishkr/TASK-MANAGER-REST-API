const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const User=require('../../src/models/user')
const Task=require("../../src/models/task")
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Abc",
  email: "abc@gmail.com",
  password: "abc@123",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET_KEY),
    },
  ],
};
const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "xyz",
  email: "xyz@gmail.com",
  password: "xyz@123",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET_KEY),
    },
  ],
};
const taskOne={
  _id:new mongoose.Types.ObjectId(),
  description:"First task",
  completed:false,
  owner:userOne._id
}
const taskTwo={
  _id:new mongoose.Types.ObjectId(),
  description:"Second task",
  completed:true,
  owner:userOne._id
}
const taskThree={
  _id:new mongoose.Types.ObjectId(),
  description:"Three task",
  completed:false,
  owner:userTwo._id
}
const setupDatabase=async()=>{
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
  }
module.exports ={userOneId,userTwoId,userTwo,userOne,taskOne,taskTwo,taskThree,setupDatabase}