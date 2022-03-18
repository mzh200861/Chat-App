const express = require('express');
const router = express.Router();
const redisClient = require('../redisClient/redis');
const io = require('../socket.js').getio();

const getRooms = async () => {
    try {
        let data = await redisClient.get('msg');
        let rooms = JSON.parse(data)
        return rooms;
    }
    catch(e) {
        console.error(e)
    }
    
}

exports.homeController =  async (req, res, next) => {
    console.log('hi')
    try {
        let rooms = await getRooms();
        res.render('index', { rooms: rooms })
        console.log(rooms)
    }
    catch (err) {
        console.log(err)
    }
}

exports.roomsController =  async (req, res, next) => {
    try {
        let rooms = await getRooms()
        if (rooms[req.body.room] != null) {
            return res.redirect('/')
        }
        rooms[req.body.room] = { users: {} };
        await redisClient.set('msg', JSON.stringify(rooms));
        res.redirect(req.body.room)
        io.emit('room-created', req.body.room)
    }
    catch (err) {
        next(err)
    }
}

exports.roomController = async (req, res, next) => {
    try {
        let rooms = await getRooms();
        if (rooms[req.params.room] == null) {
            return res.redirect('/')
        }
        res.render('room', { roomName: req.params.room })
    }
    catch(err) {
        next(err)
    }
    
}
