import pkg from 'elliptic';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { ec: EC } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ec = new EC('secp256k1');
const privateKeyLocation = path.join(__dirname, 'wallet', 'private_key');

export const initWallet = () => {
    let privateKey;
    if (fs.existsSync(privateKeyLocation)) {
        const buffer = fs.readFileSync(privateKeyLocation, 'utf8');
        privateKey = buffer.toString();
    } else {
        privateKey = generatePrivateKey();
        fs.writeFileSync(privateKeyLocation, privateKey);
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    const publicKey = key.getPublic().encode('hex');
    return { privateKeyLocation, publicKey };
};

const generatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

// Example usage:
// const wallet = initWallet();
// console.log(JSON.stringify(wallet));
