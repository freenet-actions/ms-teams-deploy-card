import moment from "moment-timezone";
import {getInput} from "@actions/core";
import {GetResponseTypeFromEndpointMethod} from "@octokit/types";

import {WebhookBody} from "../models";
import {CONCLUSION_THEMES} from "../constants";
import {renderActions} from "../utils";
import {Octokit} from '@octokit/rest';

const octokit = new Octokit();

export const OCTOCAT_LOGO_URL =
  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

export function formatCozyLayout(
  commit: GetResponseTypeFromEndpointMethod<typeof octokit.repos.getCommit>,
  conclusion: string,
  elapsedSeconds?: number
) {
  const timezone = getInput("timezone") || "UTC";
  const nowFmt = moment()
    .tz(timezone)
    .format("dddd, MMMM Do YYYY, h:mm:ss a z");
  const webhookBody = new WebhookBody();
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const branch = process.env.GITHUB_REF?.replace('refs/heads/', '');

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

  // Get potential actions
  const actions = renderActions(
    `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    commit.data.html_url
  );
  const actionsConcat = actions
    .map((action) => ` &nbsp; &nbsp; [${action.name}](${action.target})`)
    .join("");

  const author = commit.data.author;
  // Set sections
  webhookBody.sections = [
    {
      activityTitle: `**${process.env.GITHUB_WORKFLOW} #${process.env.GITHUB_RUN_NUMBER} (${branch})** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
      activityImage: author?.avatar_url || OCTOCAT_LOGO_URL,
      activitySubtitle: author
        ? `by [@${author.login}](${author.html_url}) on ${nowFmt}`
        : nowFmt,
      activityText: `${labels}${actionsConcat}`,
    },
  ];

  return webhookBody;
}
