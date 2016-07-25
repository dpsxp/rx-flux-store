const exclude = [/node_modules/];

module.exports = {
  context: __dirname,
  entry: './index.js',
  output: {
    path: './dist',
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude },
    ],
  },
};
