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
const lines = input_file.split("\n").filter((l) => l !== "");

//--------------------------------------------------

const snafu_numbers = lines.slice();

const snafu_digits = {
  0: 0,
  1: 1,
  2: 2,
  "-": -1,
  "=": -2,
};
const decimal_to_snafu_digits = Object.fromEntries(
  Object.entries(snafu_digits).map((entry) => [entry[1], entry[0]])
);

function SNAFUToDecimal(snafu) {
  let decimal = 0;
  for (let i = 0; i < snafu.length; i++) {
    decimal = decimal * 5 + snafu_digits[snafu[i]];
  }
  return decimal;
}

const total_fuel_decimal = snafu_numbers
  .map((snafu_num) => SNAFUToDecimal(snafu_num))
  .reduce((acc, curr) => acc + curr);

function decimalToSNAFU(decimal) {
  let snafu_reverse = "";
  while (decimal) {
    const remainder = { 0: 0, 1: 1, 2: 2, 3: -2, 4: -1 }[decimal % 5];
    snafu_reverse += decimal_to_snafu_digits[remainder];
    decimal = (decimal - remainder) / 5;
  }
  return snafu_reverse.split("").reverse().join("");
}

console.log(decimalToSNAFU(total_fuel_decimal));
