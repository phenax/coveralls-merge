import {execSync} from 'child_process';

const USERNAME_EMAIL_REGEX = /(.+)\s<(.+)>/,
    BRANCH_REGEX = /\* (.+)/,
    COMMIT_MESSAGE_REGEX = /\w+\s(.+)/;

const exec = (cmd, optns = {}) =>
    execSync(cmd, { maxBuffer: 100 * 1024 * 1024, ...optns }).toString();

function getHeadId() {
    return exec('git rev-parse HEAD').trim();
}

function getCommitMessage() {
    const message = exec('git log -1 --pretty=%B --oneline');

    return message.match(COMMIT_MESSAGE_REGEX)[1];
}

function getAuthorNameAndEmail() {
    const gitShow = exec('git show --format="%aN <%aE>" HEAD');

    return gitShow.match(USERNAME_EMAIL_REGEX).slice(1, 3);
}

function getCommitterNameAndEmail() {
    const gitShow = exec('git show --format="%cN <%cE>" HEAD');

    return gitShow.match(USERNAME_EMAIL_REGEX).slice(1, 3);
}

function getHead() {
    const [author_name, author_email] = getAuthorNameAndEmail(),
        [committer_name, committer_email] = getCommitterNameAndEmail();

    return {
        id: getHeadId(),
        author_name,
        author_email,
        committer_name,
        committer_email,
        message: getCommitMessage()
    };
}

function getBranch() {
    const branches = exec('git branch');

    return branches.match(BRANCH_REGEX)[1];
}

function getRemotes() {
    const remotes = exec('git remote -v').split('\n');

    return remotes
        .filter(remote => remote.endsWith('(push)'))
        .map(remote => {
            const tokens = remote.split(/\s/).filter(token => token.trim() !== '');

            return {
                name: tokens[0],
                url: tokens[1]
            };
        });
}

export const getGitInfo = () => ({
    head: getHead(),
    branch: getBranch(),
    remotes: getRemotes()
});
