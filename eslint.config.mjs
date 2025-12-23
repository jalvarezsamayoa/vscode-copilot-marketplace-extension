import typescriptEslint from "typescript-eslint";

export default [{
    ignores: ["out/**", "dist/**", "**/*.d.ts"],
}, {
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint.plugin,
    },

    languageOptions: {
        parser: typescriptEslint.parser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/naming-convention": ["warn", {
            selector: "import",
            format: ["camelCase", "PascalCase"],
        }],

        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",

        // Complexity Rules - Strict Enforcement
        "complexity": ["warn", 5],
        "max-depth": ["warn", 3],
        "max-lines-per-function": ["warn", {
            max: 30,
            skipBlankLines: true,
            skipComments: true,
        }],
        "max-params": ["warn", 3],
    },
}];