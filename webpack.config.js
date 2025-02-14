const webpack = require("webpack");
const path = require("path");

module.exports = {
	mode: process.env.NODE_ENV,
	entry: path.resolve(__dirname, "./client/index.js"),
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "bundle.js"
	},
	module: {
		rules: [
			{
				test: /\.jsx?/i,
				loader: "babel-loader",
				exclude: /node_modules/,
				options: {
					presets: ["@babel/preset-env", "@babel/preset-react"]
				}
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg|ico)$/,
				use: [
					{
						// loads files as base64 encoded data url if image file is less than set limit
						loader: "url-loader",
						options: {
							// if file is greater than the limit (bytes), file-loader is used as fallback
							limit: 8192
						}
					}
				]
			}
		]
	},
	watch: true,
	devServer: {
		publicPath: "/build",
		proxy: {
			"/homepage": "http://localhost:3000",
			"/data": "http://localhost:3000",
			"/signup": "http://localhost:3000",
			"/login": "http://localhost:3000",
			"/comments": "http://localhost:3000",
			"/gettingUser": "http://localhost:3000",
			"/logout": "http://localhost:3000",
			"/favorites": "http://localhost:3000",
			"/getfavorites": "http://localhost:3000",
			"/assets": "http://localhost:3000"
		}
	},
	resolve: {
		// Enable importing JS / JSX files without specifying their extension
		extensions: ["*", ".js", ".jsx"]
	}
};
