const path = require('path');
module.exports = {
    mode: 'development',
    entry: './src/javascript/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}