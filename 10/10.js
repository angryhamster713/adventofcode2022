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

let register = 1;
let queue = 0;
let instruction_length_counter = 0;
let line_index = 0;
let cycle_counter = 0;
const cycles_to_inspect = [20, 60, 100, 140, 180, 220];
let total_signal_strength = 0;
const screen = [];

while (line_index < lines.length) {
  if (!instruction_length_counter) {
    const instruction = lines[line_index].split(" ");

    if (instruction[0] === "addx") {
      instruction_length_counter = 2;
      queue = parseInt(instruction[1]);
    } else instruction_length_counter = 1;
  }

  //---
  // Cycle 0 is the 1st cycle
  if (cycles_to_inspect.includes(cycle_counter + 1)) {
    total_signal_strength += (cycle_counter + 1) * register;
  }

  // If currently drawn CRT row is at most 1 pixel away from sprite's center
  screen[cycle_counter] = Math.abs((cycle_counter % 40) - register) <= 1;
  //---

  if (!--instruction_length_counter && queue) {
    register += queue;
    queue = 0;
  }
  if (!instruction_length_counter) line_index++;
  cycle_counter++;
}

console.log(total_signal_strength, cycle_counter);

let crt_line_buffer = "";
screen.forEach((pixel, pixel_index) => {
  crt_line_buffer += pixel ? "#" : ".";
  if (pixel_index % 40 === 39) {
    console.log(crt_line_buffer);
    crt_line_buffer = "";
  }
});
