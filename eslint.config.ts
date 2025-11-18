import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		plugins: { js, react: pluginReact },
		extends: ["js/recommended", pluginReact.configs.flat.recommended],
		languageOptions: { globals: globals.browser },
		settings: { react: { version: "detect" } },
	},
	tseslint.configs.recommended,
	{ files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
	{ files: ["**/*.md"], plugins: { markdown }, language: "markdown/commonmark", extends: ["markdown/recommended"] },
	{ files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
	{
		ignores: ["package.json", "package-lock.json"]
	}
]);
