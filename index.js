const http = require("http");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
let data = require("./data");

morgan.token("body", (getId = (req) => JSON.stringify(req.body)));

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());
app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/api/persons", (req, res) => {
  res.json(data);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  let entry = data.entries.find((entry) => {
    return entry.id === id;
  });
  //can also be written
  //  let entry = data.entries.find((entry) => return entry.id === id;);
  if (entry) {
    res.json(entry);
  } else {
    res.statusMessage = "We don't have a resource with that ID";
    res.status(404).end();
  }
});

app.get("/info", (req, res) => {
  const totalEntries = data.entries.length;
  res.send(
    `<p>PhoneBook has info for ${totalEntries} people</p> <p>${Date()}</p>`
  );
});

function generateID() {
  const id = Math.floor(Math.random() * (400 - 5) + 5);
  return id.toString();
}

function nameExists(name, array) {
  let nameCheck = array.filter((item) => item.name === name);
  let result = nameCheck[0] ? true : false;
  return result;
}

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    res.statusMessage = "This type of request needs a name AND Number";
    //we have to return or the code will move on to the next line and
    //still add the entry even though we generated a status code
    return res.status(400).end();
  }
  if (nameExists(body.name, data.entries)) {
    res.statusMessage =
      "This name exists please make a request with a new name";
    return res.status(409).end();
  }

  const entry = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  const newList = data.entries.concat(entry);
  data.entries = newList;
  //or data.entries.concat(entry)
  res.json(entry);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  //make list of items without the item requested to be deleted
  const nonDeletedItems = data.entries.filter((entry) => entry.id !== id);
  //make the data.entries array that list
  data.entries = nonDeletedItems;
  //is it better to do it like this? or the way above?
  //   data.entries = data.entries.filter((entry) => entry.id !== id);
  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
