const express = require("express");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Router = require("./public/js/components/app/ServerRouter");
const html = require("./views");
const { productService } = require("./lib/services");
const app = express();

app.use(express.json());
app.use(express.static("./dist"));

app.get("/api/v1/products", async (req, res) => {
  const products = await productService.getTopProducts();
  res.json(products);
});

app.get("/api/v1/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const product = await productService.getProduct(productId);
  res.json(product);
});

/**
 * Second drawback, now we need to keep 2 sets of endpoints in sync
 * and make sure that the server rendered state is the same as the
 * client state.
 */

app.get("/", async (req, res) => {
  const products = await productService.getTopProducts();
  const state = { products };
  const jsx = ReactDOMServer.renderToStaticMarkup(
    <Router state={state} url={req.url} />
  );
  res.end(html(jsx, state));
});

app.get("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const product = await productService.getProduct(productId);
  const state = { selectedProduct: product };
  const jsx = ReactDOMServer.renderToStaticMarkup(
    <Router state={state} url={req.url} />
  );
  res.end(html(jsx, state));
});

app.get("/*", (req, res) => {
  const jsx = ReactDOMServer.renderToStaticMarkup(<Router url={req.url} />);
  res.end(html(jsx));
});

module.exports = app;