const path=require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack= require("webpack");

module.exports={
    mode:"production",
    entry:path.join(__dirname,"js/index.js"),
    output:{
        path:path.resolve(__dirname,"../../public/assets/dist")
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
    ]
}