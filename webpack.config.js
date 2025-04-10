const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    popup: './src/popup.ts',
    styles: './src/styles.scss',
    contentStyles: './src/content.scss',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(), // Cleans `dist/` before every build
    new MiniCssExtractPlugin({
      filename: '[name].css', // Generates styles.css and contentStyles.css separately
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/popup.html', to: 'popup.html' },
        { from: 'src/options.html', to: 'options.html' },
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/assets/icon.png', to: 'icon.png' },
      ],
    }),
  ],

  mode: 'production',
  devtool: 'source-map',

  watch: true,
};
