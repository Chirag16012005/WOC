const fs=require('fs');
const path=require('path');


const tasksFilePath = path.join(__dirname, 'tasks.json');

function getTasks() 
{
    if (!fs.existsSync(tasksFilePath)) 
        return [];

    try {
        const data=fs.readFileSync(tasksFilePath, "utf-8");
        return data ? JSON.parse(data) : [];
    } 
    catch (err) 
    {
        console.error("Error reading tasks file",err);
        return [];
    }
}


function addTask(task)
{
    const tasks=getTasks();

    tasks.push({
        id:Date.now().toString(),
        title:task,
        completed:false
    });

    fs.writeFileSync(tasksFilePath,JSON.stringify(tasks,null,2));
}

function deleteTask(taskId)
{
    const tasks=getTasks();
    const remainingtask=tasks.filter(task=>task.id!==taskId);
    
    if (tasks.length === remainingtask.length) 
    {
        console.log("Task not found");
        return;
    }

    fs.writeFileSync(tasksFilePath,JSON.stringify(remainingtask,null,2));
    console.log("Task deleted");
}

function TaskCompletion(taskId)
{
    const tasks=getTasks();
    const taskIndex=tasks.findIndex(task=>task.id===taskId);

    if (taskIndex===-1)
    {
        console.log("Task not found");
        return;
    }
    tasks[taskIndex].completed=true;
    fs.writeFileSync(tasksFilePath,JSON.stringify(tasks,null,2));
    console.log("Task marked as completed");
}

module.exports={getTasks,addTask,deleteTask,TaskCompletion};