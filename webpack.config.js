const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const ENV = process.env.NODE_ENV || 'development';
const isProd = ENV === 'production';

// ---------------------------------------------------------
// Plugins for production build
// ---------------------------------------------------------
const prodPlugins = [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    output: { comments: false },
    compress: {
      warnings: false,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
      negate_iife: false
    },
    sourceMap: true
  }),
  new CompressionWebpackPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js|css)$/,
    threshold: 10240,
    minRatio: 0.8
  }),
  new OptimizeCSSPlugin({
    cssProcessorOptions: {
      safe: true
    }
  }),
  new CopyWebpackPlugin([
    {
      context: path.resolve(__dirname, 'public_html'),
      from: { glob: './**/*', dot: true },
      to: './',
      ignore: ['index.ejs']
    }
  ])
];

// ---------------------------------------------------------
// Plugins for development
// ---------------------------------------------------------
const devPlugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new FriendlyErrorsPlugin()
];

// ---------------------------------------------------------
// Config entry
// ---------------------------------------------------------
const config = {
  context: path.resolve(__dirname, 'src'),

  entry: {
    app: './index.tsx'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'static/js/[name].[hash].js',
    chunkFilename: 'static/js/[id].[chunkhash].js'
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    modules: ['node_modules']
  },

  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  },

  devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: {
    port: process.env.PORT || 8080,
    host: 'localhost',
    publicPath: '/',
    historyApiFallback: true,
    open: true,
    openPage: '',
    overlay: true,
    hot: true,
    inline: true
  },

  module: {
    rules: [
      {
        test: /\.tsx?/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          emitErrors: true,
          faileOnHint: true,
          typeCheck: true,
          fix: false,
          tsConfigFile: 'tsconfig.json'
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, 'src')]
      },
      {
        test: /\.css$/,
        use: isProd
          ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader?minimize', 'postcss-loader']
            })
          : ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: isProd
          ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader?minimize', 'postcss-loader', 'less-loader']
            })
          : [
              'style-loader',
              'css-loader?minimize',
              'postcss-loader',
              'less-loader'
            ]
      },
      {
        test: /\.(styl|stylus)$/,
        use: isProd
          ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader?minimize', 'postcss-loader', 'stylus-loader']
            })
          : [
              'style-loader',
              'css-loader?minimize',
              'postcss-loader',
              'stylus-loader'
            ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(xml|html|txt|md)$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: isProd ? 'file-loader' : 'url-loader',
        options: {
          limit: 10000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        loader: isProd ? 'file-loader' : 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function(module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.(js|ts)x?$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, './node_modules')) === 0
        );
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),

    new ExtractTextPlugin({
      filename: 'static/css/[name].[contenthash].css',
      allChunks: true,
      disable: !isProd
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public_html/index.ejs'),
      filename: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    })
  ].concat(isProd ? prodPlugins : devPlugins)
};

module.exports = config;
