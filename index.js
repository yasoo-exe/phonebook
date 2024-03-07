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
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

//get length of data at current time
app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    const status = `<p>persons contains ${
      persons.length
    } people</p> <p>${new Date()}</p>`;
    response.send(status);
  });
});

//get individual contact
app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((contact) => response.json(contact))
    .catch((error) => {
      console.log("\x1b[31m", "there is an error", error);
      response
        .status(404)
        .send("<h1 style='color: red;'>Contact Not Found</h1>");
    });
});

//update individual contact
app.put("/api/persons/:id", (request, response) => {
  Person.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
  }).then((updatedPerson) => response.json(updatedPerson));
});

//delete individual contact
app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id).then((returnedContact) =>
    response.json(returnedContact)
  );
});

//add new contact
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "content missing!" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((person) => response.json(person));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
