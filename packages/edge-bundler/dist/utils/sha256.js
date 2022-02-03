import crypto from 'crypto';
const getStringHash = (input) => {
    const shasum = crypto.createHash('sha256');
    shasum.update(input);
    const hash = shasum.digest('hex');
    return hash;
};
export { getStringHash };
