const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server);
const redisClient  = require('./redisClient/redis')

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('utils'))
app.use(express.urlencoded({ extended: true }))

app.get('/', async(req, res) => {
  let data = await redisClient.get('msg');
  let rooms = JSON.parse(data)
  res.render('index', { rooms: rooms })
})

app.post('/room', async (req, res) => {
  let data = await redisClient.get('msg');
    let rooms = JSON.parse(data)
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} };
  
  await redisClient.set('msg', JSON.stringify(rooms));
 
  
  res.redirect(req.body.room)
  io.emit('room-created', req.body.room)
})

app.get('/:room', async(req, res) => {
  let data = await redisClient.get('msg');
  let rooms = JSON.parse(data)
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

app.use((err, req, res, next) => {
  res.status(500).send("Something went wrong");
})

server.listen(3000)
io.on('connection', socket => {
  socket.on('new-user', async(room, name) => {
    let data = await redisClient.get('msg');
    let rooms = JSON.parse(data)
    socket.join(room)
    rooms[room].users[socket.id] = name;
    await redisClient.set('msg', JSON.stringify(rooms))
    socket.to(room).broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', async(room, message) => {
    let data = await redisClient.get('msg');
    let rooms = JSON.parse(data)
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
})

