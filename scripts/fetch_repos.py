import json
import os
import urllib.request

# Fetches the public repository list for the GitHub account and
# writes a filtered, sorted snapshot to data/repos.json. Run by the
# "Update software list" GitHub Action on a weekly schedule so the
# software page never has to hit the GitHub API from the browser
# (which is rate-limited per visitor IP).

GH_USER = 'Hendrik1704'
OUTPUT_JSON = '../data/repos.json'

# Repos already featured by hand on software.html; excluded here so
# they aren't listed twice.
FEATURED_REPOS = {
    'sparkx',
    'NFDistributionTraining',
    'GPBayesTools-HIC',
    'CRONOS',
}


def fetch_repos(user):
    url = f'https://api.github.com/users/{user}/repos?per_page=100'
    request = urllib.request.Request(url)
    request.add_header('Accept', 'application/vnd.github+json')

    token = os.environ.get('GITHUB_TOKEN')
    if token:
        request.add_header('Authorization', f'Bearer {token}')

    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode('utf-8'))


def filter_and_sort(repos):
    filtered = [
        repo for repo in repos
        if not repo.get('fork') and repo.get('name') not in FEATURED_REPOS
    ]
    filtered.sort(key=lambda repo: repo.get('stargazers_count', 0), reverse=True)

    return [
        {
            'name': repo['name'],
            'html_url': repo['html_url'],
            'description': repo.get('description') or '',
            'stargazers_count': repo.get('stargazers_count', 0),
        }
        for repo in filtered
    ]


def main():
    repos = fetch_repos(GH_USER)
    result = filter_and_sort(repos)

    print(f'Fetched {len(repos)} repos, {len(result)} remain after filtering.')

    with open(OUTPUT_JSON, 'w') as f:
        json.dump(result, f, indent=4)


if __name__ == '__main__':
    main()
