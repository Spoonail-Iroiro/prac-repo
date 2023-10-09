import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  userAgent: 'MyApp v1.2.3',
});

const tag = 'v0.2.1';

try {
  const result = await octokit.rest.git.getRef({
    owner: 'Spoonail-Iroiro',
    repo: 'prac-repo',
    ref: 'tags/' + tag,
  });
  throw new Error(`Tag ${tag} already exists. Abort`);
} catch (ex) {
  if (ex.status !== undefined && ex.status === 404) {
    console.log(`${tag} doesn't exist. Continue`);
  } else {
    throw ex;
  }
}
