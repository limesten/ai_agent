import fs from "fs";
import path from "path";

function readFile(filePath) {
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

export { readFile };