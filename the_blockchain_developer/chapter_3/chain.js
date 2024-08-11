import { Block, BlockHeader } from './block.js';
import moment from 'moment';

const getGenesisBlock = () => {
    const blockHeader = new BlockHeader(1, null, "0x1bc3300000000000000000000000000000000000000000000", moment().unix(), "0x181b8330", '1DAC2B7C');
    return new Block(blockHeader, 0, null);
};

const blockchain = [getGenesisBlock()];

export const addBlock = (newBlock) => {
    const prevBlock = getLatestBlock();
    if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        blockchain.push(newBlock);
    }
};

export const getLatestBlock = () => blockchain[blockchain.length - 1];

export const getBlock = (index) => {
    return blockchain.length - 1 >= index ? blockchain[index] : null;
};

// Exporting blockchain as a named export
export { blockchain };
