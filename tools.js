import fs from "fs";
import path from "path";

/**
 * Reads a file and returns the content
 * @param {Object} args - The arguments object
 * @param {string} args.filePath - The path to the file to read
 * @returns {string} The content of the file
 */
function readFile(args) {
    if (!args || !args.filePath) {
        return "Error: No file path provided";
    }

    const filePath = args.filePath;

    console.log(`Tool: Reading file: ${filePath}`);

    try {
        // Security check: Ensure path is within the project directory
        const fullPath = path.resolve(process.cwd(), filePath);
        if (!fullPath.startsWith(process.cwd())) {
            return "Error: Path is outside of project directory";
        }

        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            return `Error: File not found at ${filePath}`;
        }

        const content = fs.readFileSync(fullPath, "utf8");
        return content;
    } catch (e) {
        return `Error: ${e.message}`;
    }
}

/**
 * Lists the contents of a directory
 * @param {Object} args - The arguments object
 * @param {string} args.dirPath - The path to the directory to list
 * @returns {string} The contents of the directory
 */
function listFiles(args) {
    if (!args || !args.dirPath) {
        return "Error: No directory path provided";
    }

    const dirPath = args.dirPath;

    console.log(`Tool: Listing files in: ${dirPath}`);

    try {
        const files = fs.readdirSync(dirPath);
        return files.join("\n");
    } catch (e) {
        return `Error: ${e.message}`;
    }
}

/**
 * Edits a file
 * @param {Object} args - The arguments object
 * @param {string} args.path - The path to the file to edit
 * @param {string} args.oldStr - The string to replace
 * @param {string} args.newStr - The string to replace with
 */
function editFile(args) {
    if (!args.path || args.oldStr === args.newStr) {
        return "Error: Invalid input parameters";
    }

    try {
        const oldContent = fs.readFileSync(args.path, "utf8");
        const newContent = oldContent.replace(args.oldStr, args.newStr);

        if (oldContent === newContent && args.oldStr != "") {
            return "Error: oldStr not found in file";
        }

        fs.writeFileSync(args.path, newContent);
    } catch (e) {
        if (e.code === "ENOENT") {
            fs.writeFileSync(args.path, args.newStr);
            return "File created successfully";
        }
        return `Error: ${e.message}`;
    }
    return "File updated successfully";
}

export { readFile, listFiles, editFile };
