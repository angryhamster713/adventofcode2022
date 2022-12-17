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

const valves = {};

const shortest_paths = {};

const line_regex =
  /^Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/;
lines.forEach((line) => {
  const match = line_regex.exec(line);
  if (!match) return;
  const [, name, flow_rate_str, leads_to] = match;
  valves[name] = {
    flow_rate: parseInt(flow_rate_str),
    leads_to: leads_to.split(", "),
  };
});

Object.entries(valves).forEach(([valve, valve_data]) => {
  const queue = [];
  const prev = {};
  const visited = [];

  queue.push(valve);
  visited.push(valve);

  while (queue.length) {
    const node = queue.shift();
    visited.push(node);

    const neighbours = valves[node].leads_to.filter(
      (neighbour) => !visited.includes(neighbour)
    );

    neighbours.forEach((neighbour) => {
      queue.push(neighbour);
      visited.push(neighbour);
      prev[neighbour] = node;
    });
  }
  const distances = Object.fromEntries(
    Object.entries(prev).map(([from_valve, previous_node], index) => {
      let distance = 0;
      for (
        let current_prev = previous_node;
        current_prev;
        current_prev = prev[current_prev]
      ) {
        distance++;
      }
      return [from_valve, distance];
    })
  );
  shortest_paths[valve] = distances;
});

const significant_valves = Object.fromEntries(
  Object.entries(valves).filter(([key, value]) => value.flow_rate)
);

const part1_possible_paths = [];

function goAndExploreValve(
  last_valve,
  new_valve,
  flow_rate,
  total_flowed,
  total_minutes,
  minutes_passed,
  valves_left,
  paths_variable,
  current_path
) {
  // Go from old to new valve
  const cost = shortest_paths[last_valve][new_valve];

  total_flowed += Math.min(cost, total_minutes - minutes_passed) * flow_rate;
  minutes_passed += cost;

  // Open new valve
  minutes_passed++;

  const new_path = [...current_path, new_valve];
  const valves_to_be_left = valves_left.filter((val) => val !== new_valve);

  if (minutes_passed > total_minutes) {
    paths_variable.push([total_flowed, new_path]);
    return;
  }

  // Flow the air out the opened valves
  total_flowed += flow_rate;

  if (!valves_to_be_left.length) {
    total_flowed +=
      (total_minutes - minutes_passed) *
      (flow_rate + valves[new_valve].flow_rate);
    paths_variable.push([total_flowed, new_path]);
    return;
  }

  // Open the new valve
  flow_rate += valves[new_valve].flow_rate;

  valves_to_be_left.forEach((valve_candidate) => {
    goAndExploreValve(
      new_valve,
      valve_candidate,
      flow_rate,
      total_flowed,
      total_minutes,
      minutes_passed,
      valves_to_be_left,
      paths_variable,
      new_path
    );
  });
}

const part1_minutes = 30;
const valves_without_start = Object.keys(significant_valves).filter(
  (val) => val !== "AA"
);
valves_without_start.forEach((valve_candidate) =>
  goAndExploreValve(
    "AA",
    valve_candidate,
    0,
    0,
    part1_minutes,
    0,
    valves_without_start,
    part1_possible_paths,
    ["AA"]
  )
);

const part1_max_value = part1_possible_paths
  .map((path) => path[0])
  .reduce((max, current) => (current > max ? current : max), 0);
console.log(part1_max_value);
