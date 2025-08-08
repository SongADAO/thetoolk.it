// import { dirname } from "path";
// import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
// import jsdoc from 'eslint-plugin-jsdoc';
import prettier from "eslint-plugin-prettier";
// import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
// import pluginVue from "eslint-plugin-vue";
// import vueParser from "vue-eslint-parser";
import unusedImports from "eslint-plugin-unused-imports";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  // eslint.configs.recommended,
  eslint.configs.all,

  // tseslint.configs.recommended,
  // tseslint.configs.strict,
  // tseslint.configs.stylistic,
  tseslint.configs.all,

  // ...pluginVue.configs["flat/recommended"],

  // reactPlugin.configs.flat.recommended
  reactPlugin.configs.flat.all,

  reactRefresh.configs.recommended,

  // reactHooks.configs["recommended-latest"],

  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),

  // importPlugin.flatConfigs.recommended,
  // importPlugin.flatConfigs.typescript,

  // jsdoc.configs["flat/recommended"],
  // jsdoc.configs["flat/recommended-typescript"],

  eslintConfigPrettier,

  {
    ignores: [
      ".git/**",
      ".next/**",
      "node_modules/**",
      "vendor/**",
      "storage/**",
      "public/**",
      "_disabled/**",
      "dist/**",
      "dist-ssr/**",
      "package-lock.json",
      "eslint.config.mjs",
      "postcss.config.mjs",
      "vite.config.js",
      "vite.config.ts",
      "vite.network.config.js",
      "vite.dashboard.config.js",
      "pwa-assets.config.js",
      "next.config.ts",
      "vite-env.d.ts",
      "next-env.d.ts",
      "public/fonts/**",
      // "**/hls-converter.ts",
      // "**/video-converter-webcodecs.ts",
    ],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      prettier: prettier,
      "unused-imports": unusedImports,
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    languageOptions: {
      // parser: vueParser,
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        // Additional options for Vue + TypeScript
        // extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "multiline-comment-style": ["error", "separate-lines"],
      "one-var": ["error", "never"],
      camelcase: ["error", { properties: "never" }],
      "id-length": [
        "error",
        { exceptions: ["$", "a", "b", "e", "i", "j", "k", "o", "x", "y"] },
      ],

      // Unwanted
      "capitalized-comments": "off",
      "class-methods-use-this": "off",
      "init-declarations": "off",
      "multiline-ternary": "off",
      "newline-per-chained-call": "off",
      "no-console": "off",
      "no-empty-function": "off",
      "no-extra-parens": "off",
      "no-magic-numbers": "off",
      "no-plusplus": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-useless-constructor": "off",
      "no-warning-comments": "off",
      "object-property-newline": "off",
      "prefer-destructuring": "off",
      "prefer-named-capture-group": "off", // ES 9 - ES 2018
      "prefer-object-spread": "off", // ES 9 - ES 2018
      "sort-imports": "off",

      // Complexity
      complexity: "off",
      "max-depth": ["error"],
      "max-lines": ["error", { max: 1000 }],
      "max-lines-per-function": ["off", { max: 100 }],
      "max-nested-callbacks": "error",
      "max-params": ["error", { max: 10 }],
      "max-statements": ["off", { max: 10 }],

      // Prettier Compatibility
      // "function-call-argument-newline": ["off", "consistent"],
      // "function-paren-newline": ["off", "consistent"],
      // "implicit-arrow-linebreak": "off",
      // "lines-around-comment": [
      //   "off",
      //   {
      //     beforeBlockComment: true,
      //     allowBlockStart: true,
      //     allowObjectStart: true,
      //     allowArrayStart: true,
      //     allowClassStart: true,
      //     ignorePattern: "tslint",
      //   },
      // ],
      // "no-mixed-operators": "off",
      // "wrap-regex": "off",
      // indent: ["off", 4, { SwitchCase: 1 }],
      // "quote-props": ["off", "as-needed", { keywords: true }],

      // Import
      // ---------------------------------------------------------------------
      // Imports Static Analysis Recommended
      "import/no-unresolved": [
        "error",
        {
          ignore: [
            "\\.css$",
            "\\.css\\?inline$",
            "\\.gif$",
            "\\.jpg$",
            "\\.mp4",
            "\\.png$",
            "\\.svg$",
            "\\.webp$",
            "\\.woff2$",
          ],
        },
      ],
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",

      // Imports Helpful Warnings Recommended
      "import/export": "error",
      "import/no-named-as-default": "error",
      "import/no-named-as-default-member": "error",

      // Imports Style Guide Warnings
      "import/no-duplicates": "error",

      // Imports Static Analysis
      "import/no-absolute-path": "error",
      "import/no-cycle": "error",
      "import/no-dynamic-require": "error",
      "import/no-internal-modules": "off",
      "import/no-relative-parent-imports": "off",
      "import/no-restricted-paths": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-webpack-loader-syntax": "off",

      // Imports Helpful Warnings
      "import/no-deprecated": "error",
      "import/no-extraneous-dependencies": "error",
      "import/no-mutable-exports": "error",

      // Imports Module Systems
      "import/no-amd": "error",
      "import/no-commonjs": "error",
      "import/no-nodejs-modules": "error",
      "import/unambiguous": "error",

      // Imports Style Guide
      "import/no-namespace": [
        "error",
        {
          ignore: ["@radix-ui/*", "react"],
        },
      ],
      "import/no-unassigned-import": [
        "error",
        {
          allow: ["rxjs/add/**", "bootstrap.native", "**/*.css", "**/*.woff2"],
        },
      ],
      "import/extensions": [
        "error",
        {
          css: "always",
          gif: "always",
          jpg: "always",
          js: "never",
          json: "always",
          png: "always",
          scss: "always",
          svg: "always",
          ts: "never",
          vue: "always",
          webp: "always",
          woff2: "always",
        },
      ],
      "import/order": [
        "off",
        {
          groups: ["builtin", "external", "parent", "sibling", "index"],
          "newlines-between": "always",
        },
      ],
      "import/dynamic-import-chunkname": "error",
      "import/exports-last": "error",
      "import/first": "error",
      "import/group-exports": "error",
      "import/max-dependencies": "off",
      "import/newline-after-import": "error",
      "import/no-anonymous-default-export": "error",
      "import/no-default-export": "off",
      "import/no-named-default": "error",
      "import/no-named-export": "off",
      "import/prefer-default-export": "off",

      // Unused Imports
      // ---------------------------------------------------------------------
      "unused-imports/no-unused-imports": "error",

      // Simple Import Sort
      // ---------------------------------------------------------------------
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",

      // Node
      // ---------------------------------------------------------------------
      // Node.js and CommonJS
      // Deprecated and moved to eslint-plugin-node
      // "callback-return": "error",
      // "global-require": "error",
      // "handle-callback-err": "error",
      // "no-buffer-constructor": "error",
      // "no-mixed-requires": "error",
      // "no-new-require": "error",
      // "no-path-concat": "error",
      // "no-process-env": "error",
      // "no-process-exit": "error",
      // "no-restricted-modules": "error",
      // "no-sync": "error",

      // Typescript
      // ---------------------------------------------------------------------
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksConditionals: true,
          checksSpreads: true,
          checksVoidReturn: {
            arguments: true,
            attributes: false,
            properties: true,
            returns: true,
            variables: true,
          },
        },
      ],
      "@typescript-eslint/no-unnecessary-type-conversion": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/return-await": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/prefer-destructuring": "off",

      // "@typescript-eslint/no-unnecessary-condition": "off",

      // React
      // ---------------------------------------------------------------------
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".jsx", ".tsx"] },
      ],
      "react/jsx-no-bind": [
        "error",
        { allowArrowFunctions: true, allowFunctions: true },
      ],
      "react/forbid-component-props": [
        "off",
        {
          forbid: [
            {
              propName: "className",
              allowedFor: [
                "As",
                "FaAngleDown",
                "FormField",
                "FormLabel",
                "FormRoot",
                "Image",
                "Link",
                "NavigationMenuContent",
                "NavigationMenuIndicator",
                "NavigationMenuItem",
                "NavigationMenuLink",
                "NavigationMenuList",
                "NavigationMenuRoot",
                "NavigationMenuTrigger",
                "NavigationMenuViewport",
                "SliderRange",
                "SliderRoot",
                "SliderThumb",
                "SliderTrack",
                "ToastAction",
                "ToastRoot",
                "ToastTitle",
                "ToastViewport",
              ],
              message: 'Prop "className" is forbidden on Components',
            },
            {
              propName: "style",
              allowedFor: [],
              message: 'Prop "style" is forbidden on Components',
            },
          ],
        },
      ],
      "react/jsx-max-depth": "off",
      "react/jsx-no-literals": "off",
      "react/jsx-props-no-spreading": "off",

      // React Refresh
      // ---------------------------------------------------------------------
      "react-refresh/only-export-components": [
        "error",
        {
          // allowConstantExport: true,
          allowExportNames: [
            "metadata",
            "generateMetadata",
            "dynamic",
            "revalidate",
          ],
        },
      ],

      // Tailwind
      // ---------------------------------------------------------------------
      // "tailwindcss/no-custom-classname": "off",

      // Next.js
      // ---------------------------------------------------------------------
      "@next/next/no-img-element": "off",

      // Vue
      // ---------------------------------------------------------------------
      // "vue/multi-word-component-names": "off",
      // "vue/no-v-html": "off",

      // JSDoc
      // ---------------------------------------------------------------------
      // // "jsdoc/check-examples": "error",
      // "jsdoc/check-indentation": "error",
      // "jsdoc/check-syntax": "error",
      // "jsdoc/match-description": "error",
      // "jsdoc/require-description-complete-sentence": "error",
      // "jsdoc/require-description": "error",
      // "jsdoc/require-hyphen-before-param-description": ["error", "never"],

      // Prettier
      // ---------------------------------------------------------------------
      "prettier/prettier": "error",

      // TODO
      // ---------------------------------------------------------------------
      // "sort-keys": "off",
      // "@typescript-eslint/require-await": "off",
      // "@typescript-eslint/no-unused-vars": "off",
      // "@typescript-eslint/explicit-member-accessibility": "off",
      // "@typescript-eslint/class-methods-use-this": "off",
      // "@typescript-eslint/member-ordering": "off",
      // "max-classes-per-file": "off",
      // "no-inline-comments": "off",
      "@typescript-eslint/max-params": "off",
      // "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
);
