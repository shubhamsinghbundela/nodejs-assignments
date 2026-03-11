const http = require("http");
const url = require("url");

let dataStore = [];
let id = 1;

const server = http.createServer((req, res) => {
  const urlData = url.parse(req.url, true);

  // ROOT ROUTE
  if (urlData.pathname === "/" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    return res.end("Hello World");
  }

  // CREATE TODO
  else if (urlData.pathname === "/create/todo" && req.method === "POST") {
    const bodyStream = [];

    req.on("data", (chunk) => {
      bodyStream.push(chunk);
    });

    req.on("end", () => {
      let body;

      try {
        body = JSON.parse(Buffer.concat(bodyStream).toString());
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Invalid JSON" }));
      }

      const newTodo = {
        id: id++,
        title: body.title,
        description: body.description,
      };

      dataStore.push(newTodo);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(dataStore));
    });
  }

  // GET ALL TODOS
  else if (urlData.pathname === "/todos" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(dataStore));
  }

  // GET TODO BY ID
  else if (urlData.pathname === "/todo" && req.method === "GET") {
    const todoId = Number(urlData.query.id);

    if (isNaN(todoId)) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Todo not found" }));
    }

    const todo = dataStore.find((t) => t.id === todoId);

    if (!todo) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Todo not found" }));
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(todo));
  }

  // DELETE TODO
  else if (urlData.pathname === "/todo" && req.method === "DELETE") {
    const todoId = Number(urlData.query.id);

    if (isNaN(todoId)) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Todo not found" }));
    }

    const index = dataStore.findIndex((t) => t.id === todoId);

    if (index === -1) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Todo not found" }));
    }

    dataStore.splice(index, 1);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(dataStore));
  }

  // INVALID ROUTES
  else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = server;