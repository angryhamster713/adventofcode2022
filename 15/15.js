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

// Inclusive -> Inclusive
function range(start, end) {
  const [left, right] = start < end ? [start, end] : [end, start];
  return new Array(right - left + 1).fill(undefined).map((_, i) => i + left);
}

function getManhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * @type {{
 * x: number,
 * y: number,
 * range: number
 * }[]}
 */
const sensors = [];

/**
 * @type {{
 * x: number,
 * y: number,
 * }[]}
 */
const beacons = [];

const line_regex =
  /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/;
lines.forEach((line) => {
  const regex_output = line_regex.exec(line);
  const [sensor_x, sensor_y, beacon_x, beacon_y] = regex_output
    .slice(1, 5)
    .map((val) => parseInt(val));
  sensors.push({
    x: sensor_x,
    y: sensor_y,
    range: getManhattanDistance(sensor_x, sensor_y, beacon_x, beacon_y),
  });
  beacons.push({ x: beacon_x, y: beacon_y });
});

const check_y = 2000000;
const check_row = new Set();
sensors.forEach((sensor) => {
  const vertical_distance = Math.abs(check_y - sensor.y);
  const remaining_range = sensor.range - vertical_distance;
  if (remaining_range < 0) return;
  range(sensor.x - remaining_range, sensor.x + remaining_range).forEach(
    check_row.add,
    check_row
  );
});

beacons
  .filter((beacon) => beacon.y === check_y)
  .forEach((beacon) => check_row.delete(beacon.x));
// sensors
//   .filter((sensor) => sensor.y === check_y)
//   .forEach((sensor) => check_row.delete(sensor.x));

console.log(check_row.size);

//--------------------------------------------------

const minimum = 0;
const maximum = 4000000;

// Inclusive -> Inclusive
function cappedBoundaries(start, end) {
  const left_capped =
    start < minimum ? minimum : start > maximum ? maximum : start;
  const right_capped = end < minimum ? minimum : end > maximum ? maximum : end;
  return [left_capped, right_capped];
}

let distress_beacon;

for (let row_index = 0; row_index <= maximum; row_index++) {
  const boundaries = [];
  sensors.forEach((sensor) => {
    const vertical_distance = Math.abs(row_index - sensor.y);
    const remaining_range = sensor.range - vertical_distance;
    if (remaining_range < 0) return;
    boundaries.push(
      cappedBoundaries(sensor.x - remaining_range, sensor.x + remaining_range)
    );
  });

  const sorted_boundaries = boundaries.sort((a, b) => a[0] - b[0]);

  const connected_boundary = [0, 0];

  for (const boundary of sorted_boundaries) {
    if (boundary[0] > connected_boundary[1] + 1) {
      distress_beacon = [connected_boundary[1] + 1, row_index];
      break;
    }
    connected_boundary[1] = Math.max(connected_boundary[1], boundary[1]);
  }

  if (distress_beacon) {
    // console.log(distress_beacon);
    break;
  }
}

console.log(distress_beacon[0] * 4000000 + distress_beacon[1]);
