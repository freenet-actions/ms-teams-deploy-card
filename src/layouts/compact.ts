import {getInput} from "@actions/core";
import {GetResponseTypeFromEndpointMethod} from "@octokit/types";

import {WebhookBody} from "../models";
import {CONCLUSION_THEMES} from "../constants";
import {Octokit} from '@octokit/rest';

const octokit = new Octokit();

export function formatCompactLayout(
  commit: GetResponseTypeFromEndpointMethod<typeof octokit.repos.getCommit>,
  conclusion: string,
  elapsedSeconds?: number
) {
  const author = commit.data.author;
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const branch = process.env.GITHUB_REF?.replace('refs/heads/', '');
  const runLink = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const webhookBody = new WebhookBody();

  // Set status and elapsedSeconds
  let labels = `\`${conclusion.toUpperCase()}\``;
  if (elapsedSeconds) {
    labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
  }

  // Set environment name
  const environment = getInput("environment");
  if (environment !== "") {
    labels += ` \`ENV:${environment.toUpperCase()}\``;
  }

  // Set themeColor
  webhookBody.themeColor = CONCLUSION_THEMES[conclusion] || "957DAD";

  let text = `${labels} &nbsp; ${process.env.GITHUB_WORKFLOW} [#${process.env.GITHUB_RUN_NUMBER}](${runLink}) ` +
    `(${branch}) on [${process.env.GITHUB_REPOSITORY}](${repoUrl}) `;
  if (author) {
    text += `by [@${author.login}](${author.html_url})`;
  }
  webhookBody.text = text;

  return webhookBody;
}
