const fs = require('fs');
const http = require('http');
const url = require('url');
const port = 8080;

//Replace text in a string using regular expression
const replaceTempmlate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  }
  return output;
};
/*
 * Read filesync  (blocking event loop)
 */

//Fetching Overview template
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);

//Fetching Product template
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

//Fetching Card template
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

//Fetching json data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');

const dataObject = JSON.parse(data);

/*
 * Create server
 */

const server = http.createServer((req, res) => {
  //   Destructuring Url Object
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    //Mapping template with data and join them with an empty string
    const cardHTML = dataObject
      .map((data) => replaceTempmlate(templateCard, data))
      .join('');

    const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardHTML);

    res.end(output);
  } else if (pathname === '/product') {
    //Status code for a successful response
    res.writeHead(200, { 'Content-type': 'text/html' });

    //Getting the product associated with the ID
    const product = dataObject[query.id];

    //Replace text in a string using regular expression
    const output = replaceTempmlate(templateProduct, product);

    res.end(output);
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, { 'Content-type': 'text/html' });
    res.end('<h1> Not Found</h1>');
  }
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Server start at port :${port}`);
});
