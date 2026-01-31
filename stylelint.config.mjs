/**
 * @type {import("stylelint").Config}
 */
const config = {
  ignoreFiles: [
    "_disabled/**",
    ".git/**",
    ".next/**",
    ".vscode/**",
    "build/**",
    "dist-ssr/**",
    "dist/**",
    "node_modules/**",
    "out/**",
    "public/**",
    "public/fonts/**",
    "eslint.config.mjs",
    "next-env.d.ts",
    "next.config.ts",
    "package-lock.json",
    "postcss.config.mjs",
    "PROGRESS.md",
    "pwa-assets.config.js",
    "storage/**",
    "stylelint.config.mjs",
    "vendor/**",
    "vite-env.d.ts",
    "vite.*.config.js",
    "vite.*.config.ts",
    "vite.config.js",
    "vite.config.ts",
  ],
  extends: [
    "stylelint-config-recommended-scss",
    "@dreamsicle.io/stylelint-config-tailwindcss",
    "stylelint-prettier/recommended",
  ],
  plugins: ["stylelint-order"],
  rules: {
    // stylelint-order
    "order/order": [
      "custom-properties",
      "dollar-variables",
      "at-variables",
      {
        type: "at-rule",
        name: "extend",
      },
      "at-rules",
      "declarations",
      "rules",
      {
        type: "at-rule",
        name: "include",
        parameter: "media-breakpoint-*",
      },
      {
        type: "at-rule",
        name: "media",
      },
    ],
    "order/properties-alphabetical-order": true,
    // stylelint-prettier
    "prettier/prettier": [
      true,
      {
        printWidth: 120,
      },
    ],
    // Custom rules
    "at-rule-empty-line-before": [
      "always",
      {
        ignore: ["after-comment"],
        ignoreAtRules: ["if", "else"],
        except: [
          "blockless-after-same-name-blockless",
          "first-nested",
          "blockless-after-blockless",
        ],
      },
    ],
    "at-rule-no-vendor-prefix": true,
    "color-hex-length": "short",
    "color-named": "never",
    "comment-empty-line-before": [
      "always",
      {
        ignore: ["after-comment", "stylelint-commands"],
        except: ["first-nested"],
      },
    ],
    "custom-property-empty-line-before": "never",
    "declaration-block-no-redundant-longhand-properties": true,
    "declaration-block-single-line-max-declarations": 1,
    "declaration-empty-line-before": "never",
    "font-family-name-quotes": "always-unless-keyword",
    "font-weight-notation": [
      "numeric",
      {
        ignore: ["relative"],
      },
    ],
    "function-name-case": "lower",
    "function-url-no-scheme-relative": true,
    "function-url-quotes": "always",
    "length-zero-no-unit": true,
    "max-nesting-depth": 5,
    "media-feature-name-no-vendor-prefix": true,
    "property-no-vendor-prefix": [
      true,
      {
        ignoreProperties: [],
      },
    ],
    "rule-empty-line-before": [
      "always",
      {
        except: ["after-single-line-comment", "first-nested"],
      },
    ],
    "selector-attribute-quotes": "always",
    "selector-no-qualifying-type": [
      true,
      {
        ignore: ["attribute"],
      },
    ],
    "selector-no-vendor-prefix": true,
    "selector-pseudo-element-colon-notation": "double",
    "selector-type-case": "lower",
    "shorthand-property-no-redundant-values": true,
    "value-keyword-case": "lower",
    "value-no-vendor-prefix": true,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep"],
      },
    ],
    // SCSS rules
    "scss/at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["tailwind", "plugin", "theme", "source"]
      }
    ],
    // Disabled rules
    "block-no-empty": null,
    "no-descending-specificity": null,
    "no-duplicate-selectors": null,
    "no-empty-source": null,
  },
};

export default config;
