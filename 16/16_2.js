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
const time = PART_2 ? 26 : 30;

function recurse(prev_path, current_valve, total_minutes, valves_left) {
  const new_path = [...prev_path, current_valve];
  const valves_to_be_left = valves_left.filter(
    (candidate) => candidate !== current_valve
  );
  let at_least_one_recursion = false;
  // i;
  valves_to_be_left.forEach((valve) => {
    const new_distance = total_minutes + shortest_paths[current_valve][valve];
    if (new_distance <= time) at_least_one_recursion = true;
    else return;
    recurse(new_path, valve, new_distance, valves_to_be_left);
  });
  if (!at_least_one_recursion) part1_possible_paths.push(new_path);
}
recurse([], "AA", 0, Object.keys(significant_valves));

const possible_flows = [];
part1_possible_paths.forEach((path) => {
  let at = "AA";
  let destination_index = 1;
  let distance_left = shortest_paths[at][path[destination_index]];
  let flow_rate = 0;
  let total_flow = 0;
  for (let minutes = 1; minutes <= time; minutes++) {
    total_flow += flow_rate;
    if (destination_index >= path.length) continue;
    if (distance_left) distance_left--;
    else {
      // Open the destination valve
      at = path[destination_index];
      flow_rate += significant_valves[path[destination_index]].flow_rate;
      destination_index++;
      if (destination_index < path.length)
        distance_left = shortest_paths[at][path[destination_index]];
    }
  }
  possible_flows.push([total_flow, path]);
});

console.log(
  possible_flows
    .map((flow) => flow[0])
    .reduce((acc, curr) => (curr > acc ? curr : acc))
);

if (!PART_2) process.exit(0);

const part_2_flows = [];
const best_paths = possible_flows
  .sort((a, b) => b[0] - a[0])
  .slice(0, 10000)
  .map((flow) => flow[1]);
best_paths.forEach((human_path, h_index) => {
  best_paths.forEach((elephant_path, e_index) => {
    const progress = h_index * 10000 + e_index;
    if (!(progress % 100000))
      console.log(((progress / 10000 ** 2) * 100).toFixed(2));
    const valves_open = Object.fromEntries(
      Object.keys(significant_valves).map((valve) => [valve, false])
    );
    let human_at = "AA";
    let human_destination_index = 1;
    let human_distance_left =
      shortest_paths[human_at][human_path[human_destination_index]];

    let elephant_at = "AA";
    let elephant_destination_index = 1;
    let elephant_distance_left =
      shortest_paths[elephant_at][elephant_path[elephant_destination_index]];

    let flow_rate = 0;
    let total_flow = 0;
    for (let minutes = 1; minutes <= time; minutes++) {
      total_flow += flow_rate;
      if (human_destination_index < human_path.length) {
        if (human_distance_left) human_distance_left--;
        else {
          // Open the destination valve
          human_at = human_path[human_destination_index];
          if (!valves_open[human_at]) {
            flow_rate +=
              significant_valves[human_path[human_destination_index]].flow_rate;
            valves_open[human_at] = true;
          }
          human_destination_index++;
          if (human_destination_index < human_path.length)
            human_distance_left =
              shortest_paths[human_at][human_path[human_destination_index]];
        }
      }
      if (elephant_destination_index < elephant_path.length) {
        if (elephant_distance_left) elephant_distance_left--;
        else {
          // Open the destination valve
          elephant_at = elephant_path[elephant_destination_index];
          if (!valves_open[elephant_at]) {
            flow_rate +=
              significant_valves[elephant_path[elephant_destination_index]]
                .flow_rate;
            valves_open[elephant_at] = true;
          }
          elephant_destination_index++;
          if (elephant_destination_index < elephant_path.length)
            elephant_distance_left =
              shortest_paths[elephant_at][
                elephant_path[elephant_destination_index]
              ];
        }
      }
    }
    part_2_flows.push(total_flow);
  });
});
console.log(part_2_flows.reduce((acc, curr) => (curr > acc ? curr : acc)));

const part1_max_value = part1_possible_paths
  .map((path) => path[0])
  .reduce((max, current) => (current > max ? current : max), 0);
console.log(part1_max_value);
