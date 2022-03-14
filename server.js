const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const id = require("shortid");
const shortid = require('shortid');
const { log } = require('console');
const { ALL } = require('dns');
const { stringify } = require('querystring');
const io = socket(server);
const cors = require('cors');
app.use(cors({ origin: true }));


server.listen('4001', '192.168.0.15' , () =>{});

let xtaken=false;
io.on('connection', (socket) =>{
    socket.on('criarJogo', (objJogo) =>
    {
        if(!objJogo['id']){objJogo['id'] = shortid.generate()}

        if(objJogo['winner']){
            objJogo['game']=['','','','','','','','',''];
        }
        if(!objJogo['nextPlayer']){objJogo['nextPlayer'] = 'X';}        
        socket.join(objJogo['id']);
        let numbRoom=(io.sockets.adapter.rooms.get(objJogo['id']).size);
        if(numbRoom==1){objJogo['xtaken']='no'}else{objJogo['xtaken']='yes'}

        objJogo['winner'] = '';
        
        io.to(objJogo['id']).emit('configGame', (objJogo));
        
    });


    socket.on('oneplay', (objJogo) =>{
        
        if(objJogo['winner']!==''){
            return;
        }
        else
        {
        if(objJogo['nextPlayer']=='X'){objJogo['nextPlayer']='O'}else
        if(objJogo['nextPlayer']=='O'){objJogo['nextPlayer']='X'} 
            //calculating winner, I tried a milion times put his into a function but it kept returning undefines
        let combos = {
            across: [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
            ],
            down: [
                [0, 3, 6],
                [1 ,4, 7],
                [2, 5, 8],
            ],
            diagonal: [
                [0, 4, 8],
                [2, 4, 6],
            ],
        };
    
        for(let combo in combos){
            combos[combo].forEach((winningPattern) => {
                if (
                    objJogo['game'][winningPattern[0]] === '' ||
                    objJogo['game'][winningPattern[1]] === '' ||
                    objJogo['game'][winningPattern[2]] ===''
                ){
                    // faz nada
                }else if(
                    objJogo['game'][winningPattern[0]] === objJogo['game'][winningPattern[1]] &&
                    objJogo['game'][winningPattern[1]] === objJogo['game'][winningPattern[2]]
                ){
                                        
                    objJogo['winner']=objJogo['game'][winningPattern[0]];
     
                }
            });
        }
            //emmitting the game object back to the other peer
        socket.to(objJogo['id']).emit('novajogada', (objJogo));
    }
    })
});