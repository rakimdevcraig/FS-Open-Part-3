const dotenv = require("dotenv").config();
const http = require("http");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
// let data = require("./data");

morgan.token("body", (getBody = (req) => JSON.stringify(req.body)));

app.use(express.static("dist"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

function getDocs() {}

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((people) => {
    res.json(people);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((individual) => {
      if (individual) {
        res.json(individual);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.get("/info", (req, res) => {
  async function getCollectionLength() {
    try {
      const count = await Person.countDocuments({});
      res.send(
        `<p>PhoneBook has info for ${count} people</p> <p>${Date()}</p>`
      );
      return count;
    } catch (error) {
      console.error("Error counting documents:", error);
      throw error;
    }
  }

  getCollectionLength();
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    // res.statusMessage = "This type of request needs a name AND Number";
    //we have to return or the code will move on to the next line and
    //still add the entry even though we generated a status code
    return res.status(400).json({
      error: "This type of request needs a name AND Number",
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => res.status(204).end())
    .catch((err) => next(err));
});

app.use(unknownEndpoint);
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
