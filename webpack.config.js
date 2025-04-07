const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'threejs-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'ShopifyThreeJS',
      type: 'umd',
      export: 'default'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};