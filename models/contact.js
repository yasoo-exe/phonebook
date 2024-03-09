require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log(`connecting to ${url}`);

mongoose
    .connect(url)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log(`error connecting to mongodb: ${error}`);
    });
const numberValidator = (number) => {
    return /(^\d{2,3})(-{1})(\d+$)/.test(number) && number.length > 7;
};

const personSchema = new mongoose.Schema({
    name: { type: String, minLength: 3 },
    number: {
        type: String,
        minLength: 8,
        validate: [
            numberValidator,
            "phone number must be at least 8 digits long and in the correct format i.e 92-321999 or 932-98765",
        ],
    },
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Person", personSchema);
