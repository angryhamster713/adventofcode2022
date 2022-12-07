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

const current_directory_path = [];
const file_list = {};
const directories_list = [];

lines.forEach((line) => {
  if (line.startsWith("$ cd")) {
    const cd_argument = line.slice("$ cd ".length);
    if (cd_argument === "..") current_directory_path.pop();
    else {
      current_directory_path.push(cd_argument);
      directories_list.push("/" + current_directory_path.slice(1).join("/"));
    }

    // continue
    return;
  }

  // Skip ls
  if (line.startsWith("$")) return;

  // Only consider files, skip 'dir dir_name' lines
  const match = /^(\d+) (.+)$/.exec(line);
  if (!match) return;
  const [, size, name] = match;
  file_list["/" + [...current_directory_path.slice(1), name].join("/")] =
    parseInt(size);
});

const directory_sizes = Object.fromEntries(
  directories_list.map((dir) => {
    const matching_files = Object.fromEntries(
      Object.entries(file_list).filter((file) => file[0].startsWith(dir))
    );
    return [
      dir,
      Object.values(matching_files).reduce((prev, curr) => prev + curr, 0),
    ];
  })
);

// Part 1
console.log(
  Object.values(directory_sizes)
    .filter((size) => size <= 100000)
    .reduce((prev, curr) => prev + curr, 0)
);

// Part 2
const TOTAL_DISK_SIZE = 70000000; // 70 million
const DISK_SPACE_REQUIRED = 30000000; // 30 million
const free_disk_space = TOTAL_DISK_SIZE - directory_sizes["/"];
const disk_space_to_delete = DISK_SPACE_REQUIRED - free_disk_space;
console.log(
  Object.values(directory_sizes)
    .sort((a, b) => a - b)
    .find((value) => value >= disk_space_to_delete)
);
