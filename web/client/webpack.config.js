const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = function (env = {}, argv) {
  const isProduction = process.env.NODE_ENV === "production" || argv.mode === "production" || process.env.PROD;
  let forkTsPlugin, defineDevelopment;

  if (!isProduction) {
    console.log(" -- DEVELOPMENT MODE -- ");
    forkTsPlugin = new ForkTsCheckerWebpackPlugin({
      reportFiles: ["src/**/*.{ts,tsx}", "!node_modules"],
    });
  }else {
    console.log(" -- PRODUCTION MODE -- ");
  }
  defineDevelopment = new webpack.DefinePlugin({
    DEV_MODE: JSON.stringify(!isProduction),
  });

  return {
    watch:isProduction?false:true,
    entry: {
      start: "./src/app/start.ts",
    },
    output: {

      filename: "static/[name][hash].bundle.js",
      chunkFilename: "static/[name][hash].bundle.js",
      path:path.resolve(__dirname,"dist/")
    },
    mode: isProduction ? "production" : "development",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test:/\.txt$/,
          loader:"raw-loader"
        },
        {
          test: /\.(t|j)sx?$/,
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            configFile: path.resolve(__dirname, "tsconfig.json"),
          },
          exclude: [/node_modules/],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: "file-loader",
          options: {
            name: "static/assets/fonts/[name].[ext]",
          },
        },
        {
          test: /\.css$/,
          use: [
            {loader:'style-loader'},
            {loader:'css-loader?url=false', options:{sourceMap:false, url:false}}
          ]
        },
        {
          test: /\.scss$/,
          use: [
            {loader:'style-loader'},
            {loader:'css-loader?url=false', options:{sourceMap:false, url:false}},
            {loader:'sass-loader?url=false', options:{sourceMap:false}}
          ]
        },

        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          use: [
            'file-loader'
          ],
          exclude: /images*\.png$/
        },
        {
          test: /images\.(png)$/,
          loader:
              'file-loader'
          ,
          options:{
            name:"static/images/[name].[ext]"
          }
        },
        {
          test: /images*\.(png)$/,
          loader: 'url-loader',
          options:{
            name:"static/images/[name].[ext]"
          }
        },
      ],
    },

    plugins: [
      ...(forkTsPlugin ? [forkTsPlugin] : []),
      ...(defineDevelopment ? [defineDevelopment] : []),
      new HtmlWebpackPlugin({
        title: "Golfcraft",
        template: path.resolve(__dirname, "src", "app", "index.ejs"),
      }),
      new CopyPlugin([ { from: "src/app/images", to: "./static/images" }]),
    ],

    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9001,
      historyApiFallback: true,
      proxy: {
        "/api": "http://localhost:2569"
      }
    },
    optimization: {
      //minimizer: [new TerserPlugin({})],
    },
  };
};
