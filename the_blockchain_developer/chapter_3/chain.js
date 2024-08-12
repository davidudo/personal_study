import { Block, BlockHeader } from './block.js';
import moment from 'moment';
import CryptoJS from 'crypto-js';

const getGenesisBlock = () => {
    const blockHeader = new BlockHeader(1, null, "0x1bc3300000000000000000000000000000000000000000000", moment().unix());
    return new Block(blockHeader, 0, null);
};

const getLatestBlock = () => blockchain[blockchain.length - 1];

const addBlock = (newBlock) => {
    const prevBlock = getLatestBlock();
    if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        blockchain.push(newBlock);
    }
};

const getBlock = (index) => {
    if (blockchain.length - 1 >= index) {
        return blockchain[index];
    } else {
        return null;
    }
};

const blockchain = [getGenesisBlock()];

const generateNextBlock = (txns) => {
    const prevBlock = getLatestBlock(),
        prevMerkleRoot = prevBlock.blockHeader.merkleRoot,
        nextIndex = prevBlock.index + 1,
        nextTime = moment().unix(),
        nextMerkleRoot = CryptoJS.SHA256(1, prevMerkleRoot, nextTime).toString();

    const blockHeader = new BlockHeader(1, prevMerkleRoot, nextMerkleRoot, nextTime);
    const newBlock = new Block(blockHeader, nextIndex, txns);
    blockchain.push(newBlock);
    return newBlock;
};

export { addBlock, getBlock, blockchain, getLatestBlock, generateNextBlock };
