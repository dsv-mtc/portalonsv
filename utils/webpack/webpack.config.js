const path=require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { extendDefaultPlugins } = require("svgo");
const webpack= require("webpack");

module.exports={
    mode:"production",
    entry:path.join(__dirname,"js/index.js"),
    output:{
        path:path.resolve(__dirname,"../../public/assets/dist"),
        assetModuleFilename: './resources/[name][ext]'
    },
    module:{
        rules:[
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
            },
            {
                test: /\.css$/i,
                use:[
                    {loader:"style-loader"},
                    {
                        loader:MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                          postcssOptions: {
                            plugins: function () {
                              return [
                                require('autoprefixer')
                              ];
                            }
                          }
                        }
                    },
                ]
            },
            {
              test:/\.(jpe?g|png|gif|svg)$/i,
              type:'asset',
            }
        ]
    },
    plugins:[
        new MiniCssExtractPlugin({}),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
          }),
        new ImageMinimizerPlugin({
          minimizerOptions:{
            plugins:[
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              ["svgo",{
                plugins:[
                  {
                    name:"removeViewBox",
                    active:false,
                  },
                  {
                    name: "addAttributesToSVGElement",
                    params: {
                      attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                    },
                  }
                ]
              }]
            ]
          }
        })
        
    ]
}