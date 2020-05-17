const path = require('path');
module.exports = {
    entry: './src/javascript/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}