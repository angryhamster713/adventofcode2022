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

const lowercase_ascii_offset = 96;
const uppercase_ascii_offset = 64;
const uppercase_priority_offset = 26;
function getCharPriority(char) {
  if (char.length !== 1) return;
  const code = char.charCodeAt(0);
  // console.log(`Char: ${char}, code: ${code}`);
  if (code >= 97 && code <= 122) {
    return code - lowercase_ascii_offset;
  } else if (code >= 65 && code <= 90) {
    return code - uppercase_ascii_offset + uppercase_priority_offset;
  } else return;
}

let part1_priority = 0;
lines.forEach((line) => {
  if (!/^[a-zA-Z]+$/.test(line)) return;
  const first_compartment = line.slice(0, line.length / 2).split("");
  const second_compartment = line.slice(line.length / 2).split("");
  const incorrent_type = first_compartment.find((item_type) =>
    second_compartment.includes(item_type)
  );
  part1_priority += getCharPriority(incorrent_type);
});

console.log(part1_priority);

//--------------------------------------------------

function splitArrayIntoChunks(input_array, chunk_size) {
  const output_array = [];
  for (let i = 0; i < input_array.length; i += chunk_size) {
    output_array.push(input_array.slice(i, i + chunk_size));
  }
  return output_array;
}

const rucksacks = lines.filter((line) => /^[a-zA-Z]+$/.test(line));
const elf_groups = splitArrayIntoChunks(rucksacks, 3);
let part2_priority = 0;
elf_groups.forEach((group) => {
  if (!group || group.length !== 3) return;
  const first_elf = group[0].split("");
  const second_elf = group[1].split("");
  const third_elf = group[2].split("");
  const badge_type = first_elf.find(
    (item_type) =>
      second_elf.includes(item_type) && third_elf.includes(item_type)
  );
  part2_priority += getCharPriority(badge_type);
});
console.log(part2_priority);
