import fs from "fs/promises";

async function getFile(filename) {
  try {
    return await fs.readFile(filename, { encoding: "utf8" });
  } catch (err) {
    console.log("Error while reading file", err);
    process.exit(1);
  }
}

const args = process.argv.slice(2);

// args[0] - input filename
const input_file = await getFile(args[0]);
const lines = input_file.split("\n");

//--------------------------------------------------

function uniqueFilter(value, index, self) {
  return self.indexOf(value) === index;
}

const data = lines[0];
for (let i = 4; i <= data.length; i++) {
  if (
    data
      .split("")
      .slice(i - 4, i)
      .filter(uniqueFilter).length === 4
  ) {
    console.log(i);
    break;
  }
}

//--------------------------------------------------

for (let i = 14; i <= data.length; i++) {
  if (
    data
      .split("")
      .slice(i - 14, i)
      .filter(uniqueFilter).length === 14
  ) {
    console.log(i);
    break;
  }
}
