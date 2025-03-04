import json
import os
import urllib.request
from datetime import datetime

# function to get  data from the InspireHEP api query
def get_inspireHep_data(url):
    try:
        with open('inspireHep.json', 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        pass

    data = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
    with open('inspireHep.json', 'w') as f:
        json.dump(data, f, indent=4)

    return data

# function to parse the data from the InspireHEP api query
def parse_data(data):
    records = []
    for hit in data['hits']['hits']:
        record = type('Values', (object,), {})()
        
        record.id = int(hit['id'])
        record.url = 'https://inspirehep.net/literature/' + str(record.id)
        record.title = hit['metadata']['titles'][0]['title']

        # Concatenate all authors into a single string
        record.authors = [author['full_name'] for author in hit['metadata']['authors']]
        record.author = '; '.join(record.authors)  # Join all author names with semicolons
        
        #if len(record.authors) > 1:
        #    record.et_al = 'et al.'
        #else:
        #    record.et_al = ''

        # First author affiliation
        if 'affiliations' in hit['metadata']['authors'][0]:
            record.first_author_affiliation = hit['metadata']['authors'][0]['affiliations'][0]['value']
            if len(hit['metadata']['authors'][0]['affiliations']) > 1:
                for i in range(1, len(hit['metadata']['authors'][0]['affiliations'])):
                    record.first_author_affiliation += ', ' + hit['metadata']['authors'][0]['affiliations'][i]['value']
        else:
            record.first_author_affiliation = ''

        record.earliest_date = hit['metadata']['earliest_date']
        record.date = datetime.strptime(record.earliest_date, "%Y-%m-%d").strftime("%B %d, %Y")
        record.earliest_year = int(hit['metadata']['earliest_date'][0:4])

        if 'dois' in hit['metadata']:
            record.doi = hit['metadata']['dois'][0]['value']
        else:
            record.doi = ''

        if 'arxiv_eprints' in hit['metadata']:
            record.arxiv_eprint = hit['metadata']['arxiv_eprints'][0]['value']
        else:
            record.arxiv_eprint = ''

        if 'abstracts' in hit['metadata']:
            record.abstract = hit['metadata']['abstracts'][0]['value']
        else:
            record.abstract = ''

        if 'publication_info' in hit['metadata']:
            if 'journal_title' in hit['metadata']['publication_info'][0]:
                record.journal = hit['metadata']['publication_info'][0]['journal_title']
            else:
                record.journal = ''
        else:
            record.journal = ''

        if 'publication_info' in hit['metadata']:
            if 'journal_volume' in hit['metadata']['publication_info'][0]:
                record.volume = hit['metadata']['publication_info'][0]['journal_volume']
            else:
                record.volume = ''
        else:
            record.volume = ''

        if 'publication_info' in hit['metadata']:
            if 'journal_issue' in hit['metadata']['publication_info'][0]:
                record.issue = hit['metadata']['publication_info'][0]['journal_issue']
            else:
                record.issue = ''
        else:
            record.issue = ''

        if 'publication_info' in hit['metadata']:
            if 'page_start' in hit['metadata']['publication_info'][0]:
                record.pages = hit['metadata']['publication_info'][0]['page_start']
            else:
                record.pages = ''
        else:
            record.pages = ''

        if 'publication_info' in hit['metadata']:
            if 'year' in hit['metadata']['publication_info'][0]:
                record.pub_year = str(hit['metadata']['publication_info'][0]['year'])
            else:
                record.pub_year = ''
        else:
            record.pub_year = ''

        records.append(record)

    return records


# function to print the records to a JSON file
def print_records_json(records, output_json):
    for record in records:
        record.__dict__ = {k: v for k, v in record.__dict__.items() if v}

    with open(output_json, 'w') as f:
        json.dump([record.__dict__ for record in records], f, indent=4)

def count_records_json(output_json):
    with open(output_json, 'r') as f:
        data = json.load(f)
    return len(data)

def main():
    # url query
    url = 'https://inspirehep.net/api/literature?sort=mostrecent&size=250&page=1&q=a%20H.Roch.1&ui-citation-summary=false'

    # file paths
    output_temp = '../data/publications_temp.json'
    output_json = '../data/publications.json'

    # requests inspireHep data from url query
    data = get_inspireHep_data(url)

    print('Total number of hits:', data['hits']['total'])
    print('------------------------------------')

    # creates our json data from the inspireHep data
    # puts it in a temp file
    records = parse_data(data)
    print_records_json(records, output_temp)

    # counts the number of records in the new (temp) file
    # and in the old file, from the active directory
    try:
        with open(output_json, 'r') as f:
            old_count = count_records_json(output_json)
            new_count = count_records_json(output_temp)
            print('Old count:', old_count)
            print('New count:', new_count)
    except FileNotFoundError:
        print('Error:  File', output_json, 'not found.')
        exit(1)

    # if there are fewer new records than old records, this
    # is considered an error
    if new_count > old_count:
        print('New json file has more records than the old json file:', new_count - old_count)
    elif new_count == old_count:
        print('New json file has the same number of records as the old json file.')
    else:
        print('Error: New json file has fewer records than the old json file.')
        exit(2)

    print_records_json(records, output_json)

    # removes the temp files
    try:
        os.remove(output_temp)
    except FileNotFoundError:
        print('Error: File to be deleted', output_temp, ' should have existed but was not found.')
        exit(3)

    try:
        os.remove('inspireHep.json')
    except FileNotFoundError:
        print('Error: File to be deleted inspireHep.json should have existed but was not found.')
        exit(4)

if __name__ == '__main__':
    main()
