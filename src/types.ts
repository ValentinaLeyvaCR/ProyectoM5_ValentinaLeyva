export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
  createdAt: string | null;
}


export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  body: string | null;
  createdAt: string;
  user: string | null;
}


export interface GitHubCommitResult {
  commitSha: string;
  commitUrl: string;
  contentPath: string;
  htmlUrl: string;
}


export interface RepoRef {
  owner: string;
  repo: string;
}
