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

const monkeys = {};

lines.forEach((line) => {
  const monkey_name = line.slice(0, 4);
  const monkey_content = line.slice(6);
  if (!isNaN(monkey_content)) {
    monkeys[monkey_name] = {
      type: "number",
      value: parseInt(monkey_content),
    };
  } else {
    const [factor1, operation, factor2] = monkey_content.split(" ");
    monkeys[monkey_name] = {
      type: operation,
      factor1,
      factor2,
    };
  }
});

function math_operation(factor1, factor2, operation) {
  switch (operation) {
    case "+":
      return factor1 + factor2;
    case "-":
      return factor1 - factor2;
    case "*":
      return factor1 * factor2;
    case "/":
      if ((factor1 / factor2) % 1 !== 0) console.error("NON-INTEGER DIVISION");
      return factor1 / factor2;
  }
}

const getNestedOperationValue = ([factor1, factor2, operation]) => {
  const computed_factor1 = Array.isArray(factor1)
    ? getNestedOperationValue(factor1)
    : factor1;
  const computed_factor2 = Array.isArray(factor2)
    ? getNestedOperationValue(factor2)
    : factor2;
  return math_operation(computed_factor1, computed_factor2, operation);
};

// Only works for part 1
function getMonkeyValue(monkey_name) {
  const monkey = monkeys[monkey_name];
  if (monkey.type === "number") return monkey.value;
  else
    return math_operation(
      getMonkeyValue(monkey.factor1),
      getMonkeyValue(monkey.factor2),
      monkey.type
    );
}

console.log(getMonkeyValue("root"));

//--------------------------------------------------

let humn_path;

// Only works for part 2, doesn't execute any of the operations, only maps them.
function getMonkeyYell(monkey_name, current_humn_path) {
  if (monkey_name === "humn") {
    humn_path = current_humn_path;
    return "humn";
  }
  const monkey = monkeys[monkey_name];
  if (monkey.type === "number") return monkey.value;
  else
    return [
      getMonkeyYell(monkey.factor1, [...current_humn_path, 0]),
      getMonkeyYell(monkey.factor2, [...current_humn_path, 1]),
      monkey.type,
    ];
}

const left = getMonkeyYell(monkeys["root"].factor1, [0]);
const right = getMonkeyYell(monkeys["root"].factor2, [1]);
// I am human.
const am_i_left = humn_path[0] === 0;

const inverse_operation = {
  "+": "-",
  "-": "+",
  "*": "/",
  "/": "*",
};

let humn_equation = JSON.parse(JSON.stringify(am_i_left ? left : right));
let other_equation = JSON.parse(JSON.stringify(am_i_left ? right : left));
humn_path.slice(1).forEach((whereami) => {
  const operation = humn_equation[2];
  if (whereami === 0) {
    const factor_to_swap = humn_equation[1];
    humn_equation = humn_equation[0];
    other_equation = [
      other_equation,
      factor_to_swap,
      inverse_operation[operation],
    ];
  } else {
    const factor_to_swap = humn_equation[0];
    humn_equation = humn_equation[1];
    switch (operation) {
      case "+":
        other_equation = [other_equation, factor_to_swap, "-"];
        break;
      case "*":
        other_equation = [other_equation, factor_to_swap, "/"];
        break;
      case "-":
        other_equation = [factor_to_swap, other_equation, "-"];
        break;
      case "/":
        other_equation = [factor_to_swap, other_equation, "/"];
        break;
    }
  }
});
if (humn_equation !== "humn") console.error("Equation unsolved!");

console.log(getNestedOperationValue(other_equation));
