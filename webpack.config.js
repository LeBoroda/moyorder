import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";
import Dotenv from "dotenv-webpack";
import webpack from "webpack";
import { config } from "dotenv";

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
      filename: "index.html",
      favicon: "img/beer-box.png",
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
      filename: "404.html",
      favicon: "img/beer-box.png",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "img",
          to: "img",
        },
        {
          from: "public",
          to: ".",
          noErrorOnMissing: true,
        },
      ],
    }),
    // Create .nojekyll file for GitHub Pages
    new (class {
      apply(compiler) {
        compiler.hooks.emit.tapAsync(
          "CreateNoJekyll",
          (compilation, callback) => {
            compilation.assets[".nojekyll"] = {
              source: () => "",
              size: () => 0,
            };
            callback();
          },
        );
      }
    })(),
    new Dotenv({
      systemvars: true,
    }),
    // Explicitly define environment variables for dynamic access
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
      "process.env.MOYSKLAD_USERNAME": JSON.stringify(
        process.env.MOYSKLAD_USERNAME,
      ),
      "process.env.MOYSKLAD_PASSWORD": JSON.stringify(
        process.env.MOYSKLAD_PASSWORD,
      ),
      "process.env.MOYSKLAD_CORS_PROXY": JSON.stringify(
        process.env.MOYSKLAD_CORS_PROXY,
      ),
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
    static: [
      {
        directory: path.join(process.cwd(), "public"),
        publicPath: "/",
      },
      {
        directory: path.join(process.cwd(), "img"),
        publicPath: "/img",
      },
    ],
    compress: true,
    port: 9000,
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api/moysklad"],
        target: "https://api.moysklad.ru/api/remap/1.2",
        changeOrigin: true,
        pathRewrite: {
          "^/api/moysklad": "",
        },
        secure: true,
        // Log proxy requests in development
        onProxyReq: (proxyReq, req) => {
          // Log Authorization header status (webpack-dev-server automatically forwards all headers)
          if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            const isBasic = authHeader.startsWith("Basic ");
            const preview = authHeader.substring(0, 20) + "...";
            console.log(
              `[PROXY] Forwarding request with Authorization header (${isBasic ? "Basic" : "Other"}): ${preview}`,
            );
          } else {
            console.warn("[PROXY] WARNING: No Authorization header in request");
          }
        },
      },
    ],
  },
};
