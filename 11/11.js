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
const lines = input_file.split("\n");

//--------------------------------------------------
const PART_2 = args[1] === "2";

function executeOperation(operation, old_number) {
  const operation_number =
    operation[1] === "old" ? old_number : parseInt(operation[1]);
  if (operation[0] === "+") return old_number + operation_number;
  else return old_number * operation_number;
}

/**
 * @type {{items: number[], operation: [string, string],
 * test_number: number, true_target: number, false_target: number}[]}
 */
const monkeys = [];
let lcm_of_test_numbers = 1;

lines.forEach((line, line_index) => {
  const definition_part = line_index % 7;
  const monkey_index = (line_index - definition_part) / 7;
  switch (definition_part) {
    case 0:
      monkeys[monkey_index] = {};
      break;
    case 1:
      monkeys[monkey_index].items = line
        .slice("  Starting items: ".length)
        .split(", ")
        .map((item) => parseInt(item));
      break;
    case 2:
      const [sign, operation_number] = line
        .slice("  Operation: new = old ".length)
        .split(" ");
      monkeys[monkey_index].operation = [sign, operation_number];
      break;
    case 3:
      const test_number = parseInt(line.slice("  Test: divisible by ".length));
      if (lcm_of_test_numbers % test_number) lcm_of_test_numbers *= test_number;
      monkeys[monkey_index].test_number = test_number;
      break;
    case 4:
      monkeys[monkey_index].true_target = parseInt(
        line.slice("    If true: throw to monkey ".length)
      );
      break;
    case 5:
      monkeys[monkey_index].false_target = parseInt(
        line.slice("    If false: throw to monkey ".length)
      );
      break;
  }
});

const monkeys_inspect_counter = [];
monkeys.forEach((_, index) => (monkeys_inspect_counter[index] = 0));

const amount_of_rounds = PART_2 ? 10000 : 20;
for (let round = 1; round <= amount_of_rounds; round++) {
  monkeys.forEach((monkey, monkey_index) => {
    while (monkey.items.length) {
      monkeys_inspect_counter[monkey_index]++;
      const item = monkey.items.shift();

      let processed_worry_level =
        executeOperation(monkey.operation, item) % lcm_of_test_numbers;
      if (!PART_2)
        processed_worry_level = Math.floor(processed_worry_level / 3);

      if (processed_worry_level % monkey.test_number === 0)
        monkeys[monkey.true_target].items.push(processed_worry_level);
      else monkeys[monkey.false_target].items.push(processed_worry_level);
    }
  });
}

// console.log(monkeys.map((monkey) => monkey.items));
console.log(monkeys_inspect_counter);
// Monkey business
console.log(
  monkeys_inspect_counter
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((collector, current) => collector * current)
);
