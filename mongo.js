const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://rcraig617:${password}@cluster0.fnral.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", phoneBookSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
if (process.argv.length === 4) {
  console.log("give number as argument");
  process.exit(1);
}

if (process.argv.length === 5) {
  const person = new Person({
    name: `${name}`,
    number: `${number}`,
  });

  person.save().then((result) => {
    console.log(`added ${result.name}'s number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
