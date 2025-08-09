const fs = require("fs");
const path = require("path");

const featureName = process.argv[2];
const includeEntity = process.argv[3]?.toLowerCase() === "true";
if (!featureName) {
  console.error("❌ Please provide a setup name for the feature");
  process.exit(1);
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toPascalCase = (str) => capitalize(str);
const toCamelContinuation = (str) => capitalize(str);
const toKebabCase = (str) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
const toUnderscoreSeparator = (str) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/\s+/g, "_").toLowerCase();
const toLowerCase = (str) => str.toLowerCase();

const baseSrc = path.join(__dirname, "..", "src");
const templateDir = path.join(__dirname, "..", "generators");

const targets = [
  { template: "controller.ts.template", baseDir: "controllers", suffix: ".controller.ts", useSubfolder: true },
  { template: "service.ts.template", baseDir: "service", suffix: ".service.ts", useSubfolder: true },
  { template: "route.ts.template", baseDir: "routes", suffix: ".route.ts", useSubfolder: false },
  { template: "validator.ts.template", baseDir: "middlewares/validators", suffix: ".validator.ts", useSubfolder: false },
];

if (includeEntity) {
  targets.push({
    template: "entity.ts.template",
    baseDir: "entity",
    suffix: ".ts",
    useSubfolder: false,
  });
}

targets.forEach(({ template, baseDir, suffix, useSubfolder }) => {
  const folderPath = useSubfolder ? path.join(baseSrc, baseDir, featureName) : path.join(baseSrc, baseDir);

  const outputPath = useSubfolder
    ? path.join(folderPath, `${featureName}${suffix}`)
    : path.join(folderPath, `${featureName}${suffix}`);

  const templatePath = path.join(templateDir, template);

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Missing template: ${template}`);
    return;
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (fs.existsSync(outputPath)) {
    console.log(`⚠️  Skipped existing file: ${outputPath}`);
    return;
  }

  const rawTemplate = fs.readFileSync(templatePath, "utf8");
  const content = rawTemplate
    .replace(/{{featureName}}/g, featureName)
    .replace(/{{FeatureName}}/g, toPascalCase(featureName))
    .replace(/{{FeatureNameCamel}}/g, toCamelContinuation(featureName))
    .replace(/{{featureSlug}}/g, toKebabCase(featureName))
    .replace(/{{featureUnderscore}}/g, toUnderscoreSeparator(featureName))
    .replace(/{{featureLower}}/g, toLowerCase(featureName))
    .replace(/{{FeatureName}}/g, capitalize(featureName));

  fs.writeFileSync(outputPath, content);
  console.log(`✅ Created: ${outputPath}`);
});


const routeFile = path.join(baseSrc, "routes", "index.ts");
const routeImportLine = `import ${featureName}Routes from "./${featureName}.route";`;
const routeUseLine = `  app.use(\`/meterly/api/\${appVersion}/${toUnderscoreSeparator(featureName)}\`, ${featureName}Routes);`;

if (fs.existsSync(routeFile)) {
  let lines = fs.readFileSync(routeFile, "utf8").split("\n");

  const hasImport = lines.some((line) => line.trim() === routeImportLine.trim());
  if (!hasImport) {
    const lastImportIndex = lines.reduce((acc, line, idx) => (line.startsWith("import ") ? idx : acc), -1);
    lines.splice(lastImportIndex + 1, 0, routeImportLine);
  }

  const hasUseLine = lines.some((line) => line.includes(routeUseLine.trim()));
  if (!hasUseLine) {
    lines.splice(-2, 0, routeUseLine);
  }

  fs.writeFileSync(routeFile, lines.join("\n"));
  console.log(`🛠 Registered route in index.ts for: ${featureName}`);
}