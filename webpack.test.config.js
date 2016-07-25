const exclude = [/node_modules/];

module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude },
    ],
  },
};
