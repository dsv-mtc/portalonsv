const path=require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { extendDefaultPlugins } = require("svgo");
const webpack= require("webpack");

module.exports={
    mode:"production",
    entry:path.join(__dirname,"js/index.js"),
    output:{
        path:path.resolve(__dirname,"../../public"),
        assetModuleFilename: './assets/[name][ext]'
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
                        loader:MiniCssExtractPlugin.loader,
                        options:{
                          esModule:false
                        }
                        
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                          postcssOptions: {
                            plugins:[
                                require('autoprefixer')
                              ] 
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
        new MiniCssExtractPlugin({
          ignoreOrder:true
        }),
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
            ]
          }
        })
        
    ]
}