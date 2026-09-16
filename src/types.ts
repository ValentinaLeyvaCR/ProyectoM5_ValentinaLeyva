//Este archivo define los tipos de datos que se van a usar en el mcp server.

export interface GitHubRepository { //interfaz para obtener la informacion de un repositorio de github
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
  createdAt: string | null;
}


export interface GitHubIssue {//interfaz para obtener la informacion de un issue de github, un issue es como una tarea o un problema que se tiene en el repositorio.
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  body: string | null;
  createdAt: string;
  user: string | null;
}


export interface GitHubCommitResult {//interfaz para obtener la informacion de un commit de github.
  commitSha: string;
  commitUrl: string;
  contentPath: string;
  htmlUrl: string;
}


export interface RepoRef {//interfaz para obtener la informacion de un repositorio de github.
  owner: string;
  repo: string;
}
