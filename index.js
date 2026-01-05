
const express = require('express');
require('dotenv').config();
const app = express();

const {getTasks, addTask, deleteTask, TaskCompletion} = require('./modules/taskManager');

const command = process.argv[2];
const argument = process.argv[3];

if (command==="add") 
{
  addTask(argument);
  console.log("Task added");
}
else if (command==="list") 
{
  console.log(getTasks());
}
else if(command==="delete"){
  deleteTask(argument);
  console.log("Task deleted");
}
else if(command==="complete"){
  TaskCompletion(argument);
  console.log("Task completed");
}
else {
  console.log("Usage:");
  console.log("npm start add \"Task name\"");
  console.log("npm start list");
}
