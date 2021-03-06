import jsonwebtoken from "jsonwebtoken";
import path from "path";
import { getFile } from "../lib/getFile";

require("dotenv-safe").config({ allowEmptyValues: true });

const GITHUB_PEM = process.env.GITHUB_PEM;
const ISSUER_ID = process.env.ISSUER_ID;

const generateJwtToken = async () => {
  const file = path.resolve(__dirname, `../../${GITHUB_PEM}`);

  const result = await getFile(file);
  return jsonwebtoken.sign(
    {
      iat: Math.floor(new Date() / 1000),
      exp: Math.floor(new Date() / 1000) + 60,
      iss: ISSUER_ID
    },
    result,
    { algorithm: "RS256" }
  );
};

const authenticate = async (client, installationId) => {
  const jwtToken = await generateJwtToken();

  client.authenticate({
    type: "app",
    token: jwtToken
  });

  const {
    data: { token }
  } = await client.apps.createInstallationToken({
    installation_id: installationId
  });

  client.authenticate({ type: "token", token });
  return client;
};

export const createIssue = async (octokit, body, issue) => {
  const id = body.installation.id;
  const repoOwner = body.repository.owner.login;
  const repoName = body.repository.name;
  const client = await authenticate(octokit, id);
  const issueObj = {
    owner: repoOwner,
    repo: repoName,
    title: issue.title,
    body: issue.body
  };

  const result = await client.issues.create(issueObj);

  return result;
};
