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
const lines = input_file.split("\n").filter((l) => l !== "");

//--------------------------------------------------
const PART_2 = args[1] === "2";

const blueprint_regex =
  /Blueprint .+: Each ore robot costs (\d+) ore\. Each clay robot costs (\d+) ore\. Each obsidian robot costs (\d+) ore and (\d+) clay\. Each geode robot costs (\d+) ore and (\d+) obsidian\./;
const blueprints = [];
lines.forEach((line) => {
  const costs = blueprint_regex.exec(line).slice(1, 7);
  const blueprint = {
    ore: { ore: costs[0] },
    clay: { ore: costs[1] },
    obsidian: { ore: costs[2], clay: costs[3] },
    geode: { ore: costs[4], obsidian: costs[5] },
  };
  blueprints.push(blueprint);
});

const total_minutes = PART_2 ? 32 : 24;

function tick(minute, blueprint, money, robots, decision, data) {
  money = { ...money };
  robots = { ...robots };

  // Assume parent checked if we have enough money to buy a new robot
  const is_building_tick = canBuildRobot(blueprint, decision, money);
  if (is_building_tick) {
    Object.entries(blueprint[decision]).forEach(
      (entry) => (money[entry[0]] -= entry[1])
    );
  }

  Object.entries(robots).forEach((entry) => (money[entry[0]] += entry[1]));

  if (minute === total_minutes) {
    if (money.geode > data.max) data.max = money.geode;
    return;
  }

  if (is_building_tick) robots[decision]++;

  const minutes_left = total_minutes - minute;
  const optimistic_estimate = (minutes_left * (minutes_left - 1)) / 2;
  const optimistic_total =
    money.geode + robots.geode * minutes_left + optimistic_estimate;
  if (optimistic_total <= data.max) return;

  if (is_building_tick) {
    generalCapabilities(blueprint, robots).forEach((future_decision) => {
      tick(minute + 1, blueprint, money, robots, future_decision, data);
    });
  } else {
    tick(minute + 1, blueprint, money, robots, decision, data);
  }
}

function canBuildRobot(blueprint, robot, money) {
  const costs = blueprint[robot];
  return Object.entries(costs).every(
    ([currency, cost]) => money[currency] >= cost
  );
}

function generalCapabilities(blueprint, robots) {
  const capabilities = [];
  const owned_robots = Object.entries(robots)
    .filter((entry) => entry[1] > 0)
    .map((entry) => entry[0]);
  Object.entries(blueprint).forEach(([robot, costs]) => {
    if (Object.keys(costs).every((currency) => owned_robots.includes(currency)))
      capabilities.push(robot);
  });
  return capabilities;
}

let part_1_total = 0;
let part_2_total = 1;

const starting_money = { ore: 0, clay: 0, obsidian: 0, geode: 0 };
const starting_robots = { ore: 1, clay: 0, obsidian: 0, geode: 0 };

const checked_blueprints = PART_2 ? blueprints.slice(0, 3) : blueprints;
checked_blueprints.forEach((blueprint, blueprint_index) => {
  const data = { max: 0 };
  generalCapabilities(blueprint, starting_robots).forEach((future_decision) => {
    tick(1, blueprint, starting_money, starting_robots, future_decision, data);
  });
  // console.log("Blueprint", blueprint_index + 1, data.max);
  part_1_total += (blueprint_index + 1) * data.max;
  part_2_total *= data.max;
});

console.log(PART_2 ? part_2_total : part_1_total);
