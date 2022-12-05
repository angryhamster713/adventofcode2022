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
const PART_2 = args[1] === "2";

// args[0] - input filename
const input_file = await getFile(args[0]);
const lines = input_file.split("\n");

//--------------------------------------------------

const separator_index = lines.indexOf("");
const number_of_stacks = lines[separator_index - 1].trim().split("   ").length;

const stacks = [];
const stack_definition = lines.slice(0, separator_index - 1);

// Stacks are indexed from the bottom, hence the reverse
stack_definition.reverse().forEach((line) => {
  for (let i = 0; i < number_of_stacks; i++) {
    if (!stacks[i]) stacks[i] = [];
    const letter_index = i * 4 + 1;
    if (line[letter_index] !== " ") stacks[i].push(line[letter_index]);
  }
});

//-------------------------

// Remove and return n items from an array
function pop_n(array, n) {
  return array.splice(-n, n);
}

const rearrange_instructions = lines.slice(separator_index + 1);
const rearrange_regex = /^move (\d+) from (\d+) to (\d+)$/;

rearrange_instructions.forEach((line) => {
  if (!rearrange_regex.test(line)) return;

  const [amount, from, to] = rearrange_regex.exec(line).slice(1, 4);

  let picked_up = pop_n(stacks[from - 1], amount);
  // Reversing the picked-up items order replicates lifting them one-by-one
  if (!PART_2) picked_up = picked_up.reverse();

  stacks[to - 1] = [...stacks[to - 1], ...picked_up];
});

console.log(
  stacks
    .map((stack) => (!stack.length ? " " : stack[stack.length - 1]))
    .join("")
);
