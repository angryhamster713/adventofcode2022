import fs from "fs/promises";

async function getFile(filename) {
  try {
    return await fs.readFile(filename, { encoding: "utf8" });
  } catch (err) {
    console.log("Error while reading file", err);
    process.exit(1);
  }
}

function splitToElfs(lines) {
  const elfs = [];

  const last_elf = lines.reduce((collector, current) => {
    if (current === "") {
      if (collector.length) elfs.push(collector);
      return [];
    }
    return [...collector, current];
  }, []);
  if (last_elf.length) elfs.push(last_elf);

  return elfs;
}

function getElfsCalories(elfs) {
  if (!elfs || !elfs.length) return [];
  return elfs.map(
    (elf) => elf.reduce((prev, current) => prev + parseInt(current), 0),
    0
  );
}

function findMaxValue(inputArray) {
  return inputArray.reduce(
    (max, current) => (current > max ? current : max),
    0
  );
}

//--------------------------------------------------

const args = process.argv.slice(2);

// args[0] - input filename
const input_file = await getFile(args[0]);
const lines = input_file.split("\n");
const elfs = splitToElfs(lines);
// console.log(elfs);
const elfs_calories = getElfsCalories(elfs);
console.log(findMaxValue(elfs_calories));
const top_3_elves = elfs_calories.sort((a, b) => b - a).slice(0, 3);
console.log(top_3_elves, `total: ${top_3_elves.reduce((p, c) => p + c)}`);
