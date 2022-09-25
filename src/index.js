const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];



function checksExistsUserAccount(request, response, next) {
 const {username} = request.headers

 const findUser = users.find(user => user.username === username)

 if(!findUser) {
    return response.status(404).json({error: 'Username was not found'})
 }

 request.user = findUser
 return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

   const findUser = users.find(user => user.username === username)

  if(findUser) {
    return response.status(400).json({error: 'User already exists'})
  }

  const user = { 
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  }

  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
 const { user } = request
 return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todo = {
      id: uuidv4(), // precisa ser um uuid
      title,
      done: false, 
      deadline: new Date(deadline),
      created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  const findTask = user.todos.find(task => task.id === id)

  if(!findTask) {
    return response.status(404).json({error: "Task wasn't found"})
  }

  findTask.title = title
  findTask.deadline = new Date(deadline)
 

  return response.json(findTask);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const findTask = user.todos.find(task => task.id === id)

  if(!findTask) {
    return response.status(404).json({error: "Task wasn't found"})
  }

  findTask.done = true
  return response.json(findTask);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  if(!id) {
    return response.status(204).json({error: "Task wasn't found"})
  }

  const findTask = user.todos.findIndex(task => task.id === id)

  if(findTask === -1) {
    return response.status(404).json({error: "Task wasn't found"})
  }

  user.todos.splice(findTask, 1)

  return response.status(204).send()
 
});

module.exports = app;