//
// For part 2, pass "2" as the second command line argument; see PART_2 variable
//

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
const lines = input_file.split("\n").filter((line) => line !== "");

//--------------------------------------------------
const PART_2 = args[1] === "2";

const DECRYPTION_KEY = 811589153;

const og_nums = lines.map((line) => parseInt(line));
const mixed_indexes = [...og_nums.keys()];

const number_of_repetitions = PART_2 ? 10 : 1;
for (let i = 0; i < number_of_repetitions; i++) {
  og_nums.forEach((num, og_num_index) => {
    const num_current_location = mixed_indexes.indexOf(og_num_index);
    mixed_indexes.splice(num_current_location, 1);
    const shift = PART_2 ? num * DECRYPTION_KEY : num;
    const new_index = (num_current_location + shift) % mixed_indexes.length;
    if (new_index === 0) mixed_indexes.push(og_num_index);
    else mixed_indexes.splice(new_index, 0, og_num_index);
  });
}

const index_of_zero = mixed_indexes.indexOf(og_nums.indexOf(0));
let significant_numbers = [1000, 2000, 3000].map(
  (significant_index) =>
    og_nums[
      mixed_indexes[(significant_index + index_of_zero) % mixed_indexes.length]
    ]
);
if (PART_2)
  significant_numbers = significant_numbers.map((num) => num * DECRYPTION_KEY);
console.log(significant_numbers.reduce((acc, curr) => acc + curr));
