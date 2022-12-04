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

let part1_total = 0;
lines.forEach((line) => {
  if (!/\d+-\d+,\d+-\d+/.test(line)) return;
  const [first_elf, second_elf] = line
    .split(",")
    .map((elf) => elf.split("-").map((x) => parseInt(x)));
  if (
    (first_elf[0] >= second_elf[0] && first_elf[1] <= second_elf[1]) ||
    (second_elf[0] >= first_elf[0] && second_elf[1] <= first_elf[1])
  )
    part1_total++;
});
console.log(part1_total);

//--------------------------------------------------

let part2_total = 0;
lines.forEach((line) => {
  if (!/\d+-\d+,\d+-\d+/.test(line)) return;
  const [first_elf, second_elf] = line
    .split(",")
    .map((elf) => elf.split("-").map((x) => parseInt(x)));

  // If any boundary is within the other range
  if (
    (first_elf[0] >= second_elf[0] && first_elf[0] <= second_elf[1]) ||
    (first_elf[1] >= second_elf[0] && first_elf[1] <= second_elf[1]) ||
    (second_elf[0] >= first_elf[0] && second_elf[0] <= first_elf[1]) ||
    (second_elf[0] >= first_elf[0] && second_elf[0] <= first_elf[1])
  )
    part2_total++;
});
console.log(part2_total);
