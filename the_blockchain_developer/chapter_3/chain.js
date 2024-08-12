import { Block, BlockHeader } from "./block.js";
import moment from "moment";
import CryptoJS from "crypto-js";
import { Level } from "level";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

const createDb = (peerId) => {
    const dir = path.join(__dirname, 'db', peerId);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        db = new Level(dir);
        storeBlock(getGenesisBlock());
    }
};

const getGenesisBlock = () => {
    const blockHeader = new BlockHeader(1, null, "0x1bc3300000000000000000000000000000000000000000000", moment().unix());
    return new Block(blockHeader, 0, null);
};

const getLatestBlock = () => blockchain[blockchain.length-1];

const addBlock = (newBlock) => {
    const prevBlock = getLatestBlock();
    if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        blockchain.push(newBlock);
        storeBlock(newBlock);
    }
};

const storeBlock = (newBlock) => {
    db.put(newBlock.index, JSON.stringify(newBlock), function (err) {
        if (err) return console.log('Oops!', err); // some kind of I/O error
        console.log('--- Inserting block index: ' + newBlock.index);
    });
};

const getDbBlock = (index, res) => {
    db.get(index, function (err, value) {
        if (err) return res.send(JSON.stringify(err));
        return res.send(value);
    });
};

const getBlock = (index) => {
    if (blockchain.length - 1 >= index)
        return blockchain[index];
    else
        return null;
};

const blockchain = [getGenesisBlock()];

const generateNextBlock = (txns) => {
    const prevBlock = getLatestBlock();
    const prevMerkleRoot = prevBlock.blockHeader.merkleRoot;
    const nextIndex = prevBlock.index + 1;
    const nextTime = moment().unix();
    const nextMerkleRoot = CryptoJS.SHA256(1, prevMerkleRoot, nextTime).toString();

    const blockHeader = new BlockHeader(1, prevMerkleRoot, nextMerkleRoot, nextTime);
    const newBlock = new Block(blockHeader, nextIndex, txns);
    blockchain.push(newBlock);
    storeBlock(newBlock);
    return newBlock;
};

export { addBlock, getBlock, blockchain, getLatestBlock, generateNextBlock, createDb, getDbBlock };
