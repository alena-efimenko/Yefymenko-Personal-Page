const fs = require('fs');

function readDirAsync(name) {
    return new Promise(resolve => {
        fs.readdir(name, (err, files) => {
            if (err) throw err;
            resolve(files);
        });
    });
}

function readFileAsync(name) {
    return new Promise(resolve => {
        fs.readFile(name, 'utf8', (err, data) => {
            if (err) throw err;
            resolve(data);
        });
    });
}

module.exports = {
    readDirAsync: readDirAsync,
    readFileAsync: readFileAsync
}
