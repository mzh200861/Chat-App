const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('./socket.js').init(server);
const redisClient  = require('./redisClient/redis');
const {homeController, roomsController, roomController} = require('./controllers/controller.js');
const errorHandler = require('./middlewares/errorHandler');

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
server.listen(3000);

app.get('/', homeController);

app.post('/room', roomsController);

app.get('/:room', roomController);

app.use(errorHandler);

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

