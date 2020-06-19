const express = require('express')
const app = express()
let https = require('https')
//.Server(app)
//const port = process.env.PORT || 3006
const fs = require('fs')

app.use(express.static('public'));

var options = {
    key: fs.readFileSync( 'ssl/server.key' ),
    cert: fs.readFileSync( 'ssl/server.cert' ),
    requestCert: false,
    rejectUnauthorized: false
};

const port = process.env.PORT || 443;
let server = https.createServer( options, app );


server.listen( port, function () {
    console.log( 'Express server listening on port ' + server.address().port );
} );
 
let io=require('socket.io')(server)




io.on('connection',socket=>{
    console.log('A socket connection was made')
    
    socket.on("create or join",room =>{
        console.log("create or join to room",room)
        const myRoom=io.sockets.adapter.rooms[room] || {length:0}
        const numClients = myRoom.length
        console.log(room,'has',numClients,'clients')
        if(numClients==0){
            socket.join(room)
            socket.emit('created',room)
        }else if(numClients==1){
            socket.join(room)
            socket.emit('joined',room)
        }else{
            socket.emit('full',room)
        }

    })

    socket.on('ready',room=>{
        socket.broadcast.to(room).emit('ready')
    })

    socket.on('candidate',event=>{
        socket.broadcast.to(event.room).emit('candidate',event)
    })

    socket.on('offer',event=>{
        socket.broadcast.to(event.room).emit('offer',event.sdp)
    })

    socket.on('answer',event=>{
        socket.broadcast.to(event.room).emit('answer',event.sdp)
    })


})


