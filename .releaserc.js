const branches = [{ name: "main" }, { name: "hml", prerelease: "beta" }];
/**
 * Checks if the current branch is a production branch.
 * @returns {boolean} True if the branch is a production branch, false otherwise.
 */
const isProductionBranch = () => {
  const branchName =
    process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_REF_NAME;
  return branches.some(
    (branch) => branch.name === branchName && !branch.prerelease,
  );
};

/**
 * Determines the CI platform and returns the corresponding semantic-release plugin configuration
 *
 * @returns{string[]} An array containing the appropriate plugin for the CI platform:
 *                    - `["@semantic-relase/github"]` for github action
 *                    - `["@semantic-release/gitlab"]` for gitlab CI
 *                    - An empty array `[]` for unknown or local CI environments
 */
const getCIPlataformConfiguration = () => {
  if (process.env.GITHUB_ACTIONS) {
    return [
      "@semantic-release/github",
      {
        successComment:
          "This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version} :tada:",
        labels: false,
        releasedLabels: false,
      },
    ];
  }
  if (process.env.GITLAB_CI) {
    return ["@semantic-release/gitlab"];
  }
  return [];
};

const changelog = isProductionBranch()
  ? "CHANGELOG.md"
  : "CHANGELOG-prerelease.md";

module.exports = {
  branches,
  ci: false,
  tagFormat: "\${version}",
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    [
      "@semantic-release/release-notes-generator",
      { preset: "conventionalcommits" },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: changelog,
        changelogTitle:
          "# Changelog\n\nAll notable changes to this project will be documented in this file.",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [changelog],
        message:
          "chore(release): version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    ...getCIPlataformConfiguration(),
  ],
};
