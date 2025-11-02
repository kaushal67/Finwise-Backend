import fs from "fs";
import pdf from "pdf-parse";

const dataBuffer = fs.readFileSync("./koto.pdf"); // put your pdf path here

pdf(dataBuffer).then(data => {
  console.log(data.text.slice(0, 4000)); // print first 4000 chars of extracted text
});
