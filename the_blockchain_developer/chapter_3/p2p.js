import crypto from 'crypto';
import Swarm from 'discovery-swarm';
import defaults from 'dat-swarm-defaults';
import getPort from 'get-port';
import * as chain from './chain.js';
import { CronJob } from 'cron';
import express from 'express';
import bodyParser from 'body-parser';
import * as wallet from './wallet.js';

const peers = {};

let connSeq = 0,
    channel = 'myBlockchain',
    registeredMiners = [],
    lastBlockMinedBy = null;

const MessageType = {
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',
    REGISTER_MINER: 'registerMiner'
};

const myPeerId = crypto.randomBytes(32);
console.log('myPeerId: ' + myPeerId.toString('hex'));

chain.createDb(myPeerId.toString('hex'));

const initHttpServer = (port) => {
    const http_port = '80' + port.toString().slice(-2);
    const app = express();
    app.use(bodyParser.json());
    app.get('/blocks', (req, res) => res.send(JSON.stringify(chain.blockchain)));
    app.get('/getBlock', (req, res) => {
        const blockIndex = req.query.index;
        res.send(chain.blockchain[blockIndex]);
    });
    app.get('/getDBBlock', (req, res) => {
        const blockIndex = req.query.index;
        chain.getDbBlock(blockIndex, res);
    });
    app.get('/getWallet', (req, res) => {
        res.send(wallet.initWallet());
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

const config = defaults({
    id: myPeerId,
});

const swarm = Swarm(config);

(async () => {
    const port = await getPort();

    initHttpServer(port);

    swarm.listen(port);
    console.log('Listening port: ' + port);

    swarm.join(channel);
    swarm.on('connection', (conn, info) => {
        const seq = connSeq;
        const peerId = info.id.toString('hex');
        console.log(`Connected #${seq} to peer: ${peerId}`);

        if (info.initiator) {
            try {
                conn.setKeepAlive(true, 600);
            } catch (exception) {
                console.log('exception', exception);
            }
        }

        conn.on('data', (data) => {
            const message = JSON.parse(data);
            console.log('----------- Received Message start -------------');
            console.log(
                'from: ' + peerId,
                'to: ' + message.to,
                'my: ' + myPeerId.toString('hex'),
                'type: ' + JSON.stringify(message.type)
            );
            console.log('----------- Received Message end -------------');

            switch (message.type) {
                case MessageType.REQUEST_BLOCK:
                    console.log('-----------REQUEST_BLOCK-------------');
                    const requestedIndex = message.data.index;
                    const requestedBlock = chain.getBlock(requestedIndex);
                    if (requestedBlock)
                        writeMessageToPeerToId(peerId, MessageType.RECEIVE_NEXT_BLOCK, requestedBlock);
                    else
                        console.log('No block found @ index: ' + requestedIndex);
                    console.log('-----------REQUEST_BLOCK-------------');
                    break;
                case MessageType.RECEIVE_NEXT_BLOCK:
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    chain.addBlock(message.data);
                    console.log('Blockchain: ' + JSON.stringify(chain.blockchain));
                    const nextBlockIndex = chain.getLatestBlock().index + 1;
                    console.log('-- request next block @ index: ' + nextBlockIndex);
                    writeMessageToPeers(MessageType.REQUEST_BLOCK, { index: nextBlockIndex });
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    break;
                case MessageType.RECEIVE_NEW_BLOCK:
                    if (message.to === myPeerId.toString('hex') && message.from !== myPeerId.toString('hex')) {
                        console.log('-----------RECEIVE_NEW_BLOCK------------- ' + message.to);
                        chain.addBlock(message.data);
                        console.log(JSON.stringify(chain.blockchain));
                        console.log('-----------RECEIVE_NEW_BLOCK------------- ' + message.to);
                    }
                    break;
                case MessageType.REQUEST_ALL_REGISTER_MINERS:
                    console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                    writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);
                    registeredMiners = message.data;
                    console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                    break;
                case MessageType.REGISTER_MINER:
                    console.log('-----------REGISTER_MINER------------- ' + message.to);
                    registeredMiners = message.data;
                    console.log(registeredMiners);
                    console.log('-----------REGISTER_MINER------------- ' + message.to);
                    break;
            }
        });

        conn.on('close', () => {
            console.log(`Connection ${seq} closed, peerId: ${peerId}`);
            if (peers[peerId]?.seq === seq) {
                delete peers[peerId];
                console.log('--- registeredMiners before: ' + JSON.stringify(registeredMiners));
                const index = registeredMiners.indexOf(peerId);
                if (index > -1)
                    registeredMiners.splice(index, 1);
                console.log('--- registeredMiners end: ' + JSON.stringify(registeredMiners));
            }
        });

        if (!peers[peerId]) {
            peers[peerId] = {};
        }
        peers[peerId].conn = conn;
        peers[peerId].seq = seq;
        connSeq++;
    });
})();

const writeMessageToPeers = (type, data) => {
    for (const id in peers) {
        console.log('-------- writeMessageToPeers start -------- ');
        console.log('type: ' + type + ', to: ' + id);
        console.log('-------- writeMessageToPeers end ----------- ');
        sendMessage(id, type, data);
    }
};

const writeMessageToPeerToId = (toId, type, data) => {
    for (const id in peers) {
        if (id === toId) {
            console.log('-------- writeMessageToPeerToId start -------- ');
            console.log('type: ' + type + ', to: ' + toId);
            console.log('-------- writeMessageToPeerToId end ----------- ');
            sendMessage(id, type, data);
        }
    }
};

const sendMessage = (id, type, data) => {
    peers[id].conn.write(JSON.stringify({
        to: id,
        from: myPeerId.toString('hex'),
        type,
        data
    }));
};

setTimeout(() => {
    writeMessageToPeers(MessageType.REQUEST_ALL_REGISTER_MINERS, null);
}, 5000);

setTimeout(() => {
    writeMessageToPeers(MessageType.REQUEST_BLOCK, { index: chain.getLatestBlock().index + 1 });
}, 5000);

setTimeout(() => {
    registeredMiners.push(myPeerId.toString('hex'));
    console.log('----------Register my miner --------------');
    console.log(registeredMiners);
    writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);
    console.log('---------- Register my miner --------------');
}, 7000);

const job = new CronJob('30 * * * * *', function() {
    let index = 0; // first block
    if (lastBlockMinedBy) {
        const newIndex = registeredMiners.indexOf(lastBlockMinedBy);
        index = (newIndex + 1 > registeredMiners.length - 1) ? 0 : newIndex + 1;
    }
    lastBlockMinedBy = registeredMiners[index];
    console.log('-- REQUESTING NEW BLOCK FROM: ' + registeredMiners[index] + ', index: ' + index);
    console.log(JSON.stringify(registeredMiners));
    if (registeredMiners[index] === myPeerId.toString('hex')) {
        console.log('-----------create next block -----------------');
        const newBlock = chain.generateNextBlock(null);
        chain.addBlock(newBlock);
        console.log(JSON.stringify(newBlock));
        writeMessageToPeers(MessageType.RECEIVE_NEW_BLOCK, newBlock);
        console.log(JSON.stringify(chain.blockchain));
        console.log('-----------create next block -----------------');
    }
});

job.start();
