const Request = require('request-promise-native');
const Env = require("../env");
const QueryString = require("querystring");
const LinkHeaderParse = require("parse-link-header");

const options = {
    headers: {
        "Private-Token": Env.GITLAB_PERSONAL_TOKEN
    },
    json: true,
};

exports._decorateLinks = (link, templateFunction, templateArgs, query) => {
    const linkObj = {};
    if (link) {
        link = LinkHeaderParse(link);
        for (const key of Object.keys(link)) {
            linkObj[key] = () => templateFunction.apply(null, [...templateArgs, { ...query, page: link[key].page, per_page: link[key].per_page }]);
        }
    }
    return linkObj;
};


exports.getRepoByProjectId = async (projectId) => {
    return Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}`, ...options })
};

exports.searchMergeRequestsByProjectId = async (projectId, query) => {
    const queryString = query ? QueryString.stringify(query) : null;
    const res = await Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/merge_requests${queryString ? `?${queryString}` : ""}`, ...options, resolveWithFullResponse: true });
    return { mergeRequests: res.body, _link: { ...exports._decorateLinks(res.headers.link, exports.searchMergeRequestsByProjectId, [projectId], query) } }
};

exports.searchIssuesByProjectId = async (projectId, query) => {
    const queryString = query ? QueryString.stringify(query) : null;
    const res = await Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/issues${queryString ? `?${queryString}` : ""}`, ...options, resolveWithFullResponse: true });
    return { issues: res.body, _link: { ...exports._decorateLinks(res.headers.link, exports.searchIssuesByProjectId, [projectId], query) } }
};

exports.searchTagsByProjectId = async (projectId, query) => {
    const queryString = query ? QueryString.stringify(query) : null;
    const res = await Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/tags${queryString ? `?${queryString}` : ""}`, ...options, resolveWithFullResponse: true });
    return { tags: res.body, _link: { ...exports._decorateLinks(res.headers.link, exports.searchTagsByProjectId, [projectId], query) } }
};

exports.getMergeRequestByProjectIdAndMergeRequestId = async (projectId, mergeRequestId) => {
    return Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/merge_requests/${mergeRequestId}`, ...options })
};

exports.getIssueByProjectIdAndIssueId = async (projectId, issueId) => {
    return Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/issues/${issueId}`, ...options });
};

exports.getTagByProjectIdAndTagId = async (projectId, tagName) => {
    return Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/tags/${tagName}`, ...options });
};

exports.getCommitByProjectIdAndSha = async (projectId, sha) => {
    return Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/commits/${sha}`, ...options });
};

exports.findCommitRefsByProjectIdAndSha = async (projectId, sha, query) => {
    const queryString = query ? QueryString.stringify(query) : null;
    return Request({ uri: `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/repository/commits/${sha}/refs${queryString ? `?${queryString}` : ""}`, ...options });
};

exports.createTagReleaseByProjectIdTagNameAndTagId = async (projectId, body) => {
    const uri = `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/releases`;
    Logger.debug(`Create tag release by ProjectIdTagNameAndTagId`, 'uri', uri, 'body', body);
    return Request({ uri, method: "POST", body, ...options });
};

exports.updateTagReleaseByProjectIdTagNameAndTagId = async (projectId, tagName, body) => {
    const uri = `${Env.GITLAB_API_ENDPOINT}/projects/${projectId}/releases/${tagName}`;
    Logger.debug(`Update tag release by ProjectIdTagNameAndTagId`, 'uri', uri, 'body', body);
    return Request({ uri, method: "PUT", body, ...options });
};

