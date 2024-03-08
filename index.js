require("dotenv").config();
const express = require("express");
const Person = require("./models/contact");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.static("dist"));

app.use(cors());
app.use(express.json());

morgan.token("req-body", (req) => {
  return req.method === "POST" && req.body ? JSON.stringify(req.body) : null;
});

// Use morgan middleware with the tiny format and the custom token for printing the body of the POST request
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body",
    { stream: process.stdout }
  )
);

//get whole persons
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

//get length of data at current time
app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const status = `<p>persons contains ${
        persons.length
      } people</p> <p>${new Date()}</p>`;
      response.send(status);
    })
    .catch((error) => next(error));
});

//get individual contact
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((contact) =>
      contact ? response.json(contact) : response.status(404).end()
    )
    .catch((error) => next(error));
});

//update individual contact
app.put("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
  })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

//delete individual contact
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((returnedContact) => response.json(returnedContact))
    .catch((error) => next(error));
});

//add new contact
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "content missing!" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((person) => response.json(person))
    .catch((error) => next(error));
});

//errorHandler
const errorHandler = (error, request, response, next) => {
  return error.name === "CastError"
    ? response.status(400).send({ error: "malformatted id" })
    : console.log(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
