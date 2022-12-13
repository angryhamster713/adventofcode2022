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

const signal_pairs = lines.reduce((resultArray, current, index) => {
  const signal_group_index = Math.floor(index / 3);

  if (!resultArray[signal_group_index]) resultArray[signal_group_index] = [];
  if (index % 3 !== 2)
    resultArray[signal_group_index].push(JSON.parse(current));

  return resultArray;
}, []);

function compare(left, right) {
  if (Number.isInteger(left) && Number.isInteger(right)) {
    return Math.sign(right - left);
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
      const result = compare(left[i], right[i]);
      if (result) return result;
    }

    return compare(left.length, right.length);
  }

  return compare([left].flat(), [right].flat());
}

let part1_total = 0;
signal_pairs.forEach((pair, pair_index) => {
  const result = compare(pair[0], pair[1]);
  if (result === 1) part1_total += pair_index + 1;
});

console.log(part1_total);

//--------------------------------------------------

const signals = [...signal_pairs.flat(), [[2]], [[6]]];

const compare_sort = (a, b) => compare(b, a);

let part2_total = 1;
signals.sort(compare_sort).forEach((signal, index) => {
  if (["[[2]]", "[[6]]"].includes(JSON.stringify(signal)))
    part2_total *= index + 1;
});
console.log(part2_total);
