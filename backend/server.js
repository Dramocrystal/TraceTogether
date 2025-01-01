const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const v8 = require('v8');
const { get } = require('https');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server, path: '/socket/' });


app.use(express.json());
app.use(cors());


const rooms = {};
const roomHistories = new Map();

const generateRoomCode = () => {
    let code;
    do {
        code = crypto.randomInt(10000, 99999).toString(); // 5-digit code
    } while (rooms[code]); // Ensure the code is unique
    return code;
};

wss.on('connection', (ws) => {
    console.log('A client connected');
    ws.room = null;
    ws.user = null;

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        switch (message.type) {
            case 'host':
                handleHostRoom(ws, message.name);
                break;
            
            case 'join':
                handleJoinRoom(ws, message.code, message.name);
                break;

            case 'message':
                handleRoomMessage(ws, message.content);
                break;

            case 'cursor':
                broadcastCursor(ws, message);
                break;
            case 'drawing':
                broadcastDrawing(ws, message);
            
            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));

        }
    });

    ws.on('close', () => {
        handleLeaveRoom(ws);
        console.log("Client Disconnected");
    });
});

function broadcastCursor(ws, message) {
    const { username, position } = message; // Extract the username and cursor position from the message

    if (!ws.room || !rooms[ws.room]) {
        ws.send(JSON.stringify({ type: 'error', message: 'You are not in a room' }));
        return;
    }

    // Broadcast cursor position to everyone else in the room
    const cursorData = JSON.stringify({
        type: 'cursor',
        username,
        position,
    });

    rooms[ws.room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(cursorData);
        }
    });
}

function broadcastDrawing(ws, message){
    if (!ws.room || !rooms[ws.room]) {
        ws.send(JSON.stringify({ type: 'error', message: 'You are not in a room' }));
        return;
    }

    const drawingAction = { ...message };

    const roomHistory = roomHistories.get(ws.room);
    if (roomHistory) {
        roomHistory.push(drawingAction);
        // console.log(`Current history size: ${getObjectSize(roomHistory)} bytes`);
    }

    const drawingData = JSON.stringify({
        type: 'drawing',
        ...message, // Spread the drawing event details
    });

    rooms[ws.room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(drawingData);
        }
    });

}

function getObjectSize(obj) {
    return v8.serialize(obj).length;
  }
  

function handleHostRoom(ws, name) {
    const roomCode = generateRoomCode();
    rooms[roomCode] = new Set(); //create a set to hold participants
    rooms[roomCode].add(ws); //add host ws to participants
    roomHistories.set(roomCode, []); //empty canvas history for the room
    ws.room = roomCode;
    ws.user = name;


    ws.send(JSON.stringify({ type: 'hosted', code: roomCode }));
    console.log(`New room created: ${roomCode} by ${name}`);

    printRooms();
}

function handleJoinRoom(ws, code, name) {
    if (!rooms[code]) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
    }

    //Add client to the room
    rooms[code].add(ws);
    ws.room = code;
    ws.user = name;

    //Send the current state to the joining user.
    const history = roomHistories.get(code) || [];
    ws.send(JSON.stringify({ type: 'canvasHistory', history }));

    //Notify the client that the join was successfull
    ws.send(JSON.stringify({ type: 'joined', code }));
    console.log(`${name} joined room: ${code}`);

    //notify all other people in the room that someone joined
    const notification = JSON.stringify({ type: 'notification', message: `${name} has joined the room`, JLType:'success'});
    rooms[code].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(notification);
        }
    })

    printRooms();
}

function handleLeaveRoom(ws) {
    if (ws.room && rooms[ws.room]) {
        const notification = JSON.stringify({ type: 'notification', message: `${ws.user} has left the room`, JLType:'error'});
        rooms[ws.room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(notification);
        }
    })
        rooms[ws.room].delete(ws);

        if (rooms[ws.room].size === 0) {
            delete rooms[ws.room];
            console.log(`Room ${ws.room} deleted (no participants left)`);
        }
    }

    ws.room = null;
}


function handleRoomMessage(ws, content) {
    if (!ws.room || !rooms[ws.room]) {
        ws.send(JSON.stringify({ type: 'error', message: 'You are not in a room' }));
        return;
    }

    const message = JSON.stringify({ type: 'message', from: ws.room, content });
    rooms[ws.room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function printRooms() {
    if (Object.keys(rooms).length === 0) {
        console.log("No rooms available.");
        return;
    }

    console.log("Current Rooms:");
    Object.keys(rooms).forEach((roomCode) => {
        const participants = Array.from(rooms[roomCode]).map(client => client.user || "Unknown");
        console.log(`Room Code: ${roomCode}, Participants: ${participants.join(", ")}`);
    });
}




// Test route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
