import { readFile, listFiles, editFile } from "./tools.js";

const toolRegistry = [
    {
        name: "readFile",
        description: "Reads a file and returns the content",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file to read",
                },
            },
            required: ["filePath"],
        },
        handler: readFile,
    },
    {
        name: "listFiles",
        description: "List the contents of a directory",
        parameters: {
            type: "object",
            properties: {
                dirPath: {
                    type: "string",
                    description: "The path to the directory to list",
                },
            },
            required: ["dirPath"],
        },
        handler: listFiles,
    },
    {
        name: "editFile",
        description: `Make edits to a text file.

        Replaces 'oldStr' with 'newStr' in the given file. 'oldStr' and 'newStr' MUST be different from each other.

        If the file specified with path doesn't exist, it will be created.
        `,
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "The path to the file" },
                oldStr: {
                    type: "string",
                    description:
                        "Text to search for - must match exactly and must only have one match exactly",
                },
                newStr: {
                    type: "string",
                    description: "Text to replace the oldStr with",
                },
            },
            required: ["path", "oldStr", "newStr"],
        },
        handler: editFile,
    },
];

export default toolRegistry;