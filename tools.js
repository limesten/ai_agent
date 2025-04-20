import fs from "fs";
import path from "path";

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
    } catch(e) {
        return `Error: ${e.message}`;
    }
}

function listFiles(args) {
    if (!args || !args.dirPath) {
        return "Error: No directory path provided";
    }

    const dirPath = args.dirPath;

    console.log(`Tool: Listing files in: ${dirPath}`);

    try {
        const files = fs.readdirSync(dirPath);
        return files.join("\n");
    } catch(e) {
        return `Error: ${e.message}`;
    }
}

export { readFile, listFiles };