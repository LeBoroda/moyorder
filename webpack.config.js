import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import Dotenv from "dotenv-webpack";
import webpack from "webpack";
import { config } from "dotenv";

// Load .env file to get values for DefinePlugin
config();

export default {
  entry: "./src/main.tsx",
  output: {
    filename: "main.js",
    path: path.resolve(process.cwd(), "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
    new Dotenv({
      systemvars: true,
    }),
    // Explicitly define environment variables for dynamic access
    new webpack.DefinePlugin({
      "process.env.MOYSKLAD_USERNAME": JSON.stringify(
        process.env.MOYSKLAD_USERNAME,
      ),
      "process.env.MOYSKLAD_PASSWORD": JSON.stringify(
        process.env.MOYSKLAD_PASSWORD,
      ),
      "process.env.MOYSKLAD_TOKEN": JSON.stringify(process.env.MOYSKLAD_TOKEN),
      "process.env.ORDER_NOTIFICATION_EMAIL": JSON.stringify(
        process.env.ORDER_NOTIFICATION_EMAIL,
      ),
      "process.env.EMAILJS_PUBLIC_KEY": JSON.stringify(
        process.env.EMAILJS_PUBLIC_KEY,
      ),
      "process.env.EMAILJS_SERVICE_ID": JSON.stringify(
        process.env.EMAILJS_SERVICE_ID,
      ),
      "process.env.EMAILJS_TEMPLATE_ID": JSON.stringify(
        process.env.EMAILJS_TEMPLATE_ID,
      ),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(process.cwd(), "public"),
    },
    compress: true,
    port: 9000,
    proxy: [
      {
        context: ["/api/moysklad"],
        target: "https://api.moysklad.ru/api/remap/1.2",
        changeOrigin: true,
        pathRewrite: {
          "^/api/moysklad": "",
        },
        secure: true,
      },
    ],
  },
};
