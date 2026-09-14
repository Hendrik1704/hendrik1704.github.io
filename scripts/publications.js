// This makeList function in this script runs when the publications page 
// is loaded.  This script writes the html for the publications list
// using data from the data/publications.json file.

let pubDataFile = "/data/publications.json";
let pubID = "#pubList";

// The html for the publications list is passed to this function,
// which writes it to the page at location of the "pubList" id.
let writeHTML = (str) => {
    let container = document.getElementById("pubList");
    let newDiv = document.createElement("div");
    newDiv.innerHTML = str;
    container.appendChild(newDiv);
};

// One of the fields in the json file lists the article year.
// This function returns an array of unique keys, sorted in descending 
// order, and can be used to return an array of unique years.
let getUnique = (arr, key) => {
    let unique = [];
    for (let i = 0; i < arr.length; i++) {
        if (unique.indexOf(arr[i][key]) === -1) {
            unique.push(arr[i][key]);
        }
    }
    return unique.sort().reverse();
};

// Sort items within each year from newest to oldest so the latest
// publication appears at the top of each year section.
let sortByDateDesc = (a, b) => {
    const dateA = new Date(a.earliest_date || a.date || `${a.pub_year || '0000'}-12-31`);
    const dateB = new Date(b.earliest_date || b.date || `${b.pub_year || '0000'}-12-31`);
    return dateB - dateA;
};

// This function builds the html string for the publications list.
let buildString = (arr) => {
    let str = "";
    let uniqueYears = getUnique(arr, "earliest_year");
    let totalPublications = arr.length;
    let nextNumber = totalPublications;

    for (let i = 0; i < uniqueYears.length; i++) {

        // prints the relevant as a header
        str += "<h3 class=\"yearHeader\">" + uniqueYears[i] + "</h3>";
        let yearItems = arr.filter(item => item.earliest_year === uniqueYears[i]).sort(sortByDateDesc);

        for (let j = 0; j < yearItems.length; j++) {
            const itemNumber = nextNumber;
            nextNumber -= 1;

            // a div to apply css formatting to the article block
            str += "<div class=\"articleBlock\">";
            str += "<span class=\"pub-number\">" + itemNumber + "</span>";
            str += "<div class=\"articleContent\">";

            // title first, bolded, then author list
            if (yearItems[j].title && yearItems[j].url)
                str += "<p><strong><a href=\"" + yearItems[j].url + "\">" + yearItems[j].title + "</a></strong></p>";
            else if (yearItems[j].title)
                str += "<p><strong>" + yearItems[j].title + "</strong></p>";

            // if the author field is not empty, print it
            if (yearItems[j].author)
                str += "<p>" + yearItems[j].author;
                if (yearItems[j].first_author_affiliation)
                    str += " (" + yearItems[j].first_author_affiliation + ")";
                if (yearItems[j].et_al)
                    str += " et al.";
                if (yearItems[j].date)
                    str += " (" + yearItems[j].date + ")";
                str += "</p>";
            
            // if the journal fields are not empty, print them
            // along with any volume number, issue number, page numbers, year
            if (yearItems[j].journal) {
                if (yearItems[j].journal)
                    str += "<p>" + yearItems[j].journal;
                if (yearItems[j].volume)
                    str += ", vol. " + yearItems[j].volume;
                if (yearItems[j].number)
                    str += ", no. " + yearItems[j].number;
                if (yearItems[j].pages)
                    str += ", pp. " + yearItems[j].pages;
                if (yearItems[j].pub_year)
                    str += " (" + yearItems[j].pub_year + ")";
                str += "</p>";
            }

            // if the url, doi, or arxiv_eprint fields are not empty, print them as links
            // in a collapsible div
            if (yearItems[j].url || yearItems[j].doi) {
                str += "<button type=\"button\" class=\"collapsible\">Links</button>";
                str += "<div class=\"content\">";
                if (yearItems[j].doi)
                    str += "<p><a href=\"https://doi.org/" + yearItems[j].doi + "\">" +
                     yearItems[j].doi + "</a></p>";
                if (yearItems[j].url)
                    str += "<p><a href=\"" + yearItems[j].url + "\">" + yearItems[j].url + "</a></p>";
                if (yearItems[j].arxiv_eprint)
                    str += "<p>e-print: <a href=\"https://arxiv.org/abs/" + yearItems[j].arxiv_eprint + "\">" +
                     yearItems[j].arxiv_eprint + "</a></p>";
                str += "</div>";
            }

            // if the abstract field is not empty, print it in a collapsible div
            if (yearItems[j].abstract) {
                str += "<button type=\"button\" class=\"collapsible\">Abstract</button>";
                str += "<div class=\"content\">";
                str += "<p>" + yearItems[j].abstract + "</p>";
                str += "</div>";
            }

            str += "</div>"; // end articleContent
            str += "</div>"; // end articleBlock
            str += "<br>";
        }
    }
    return str;
};

// This function provides listeners so the links and abstract fields
// can be expanded and collapsed.
let collapseListeners = () => {
    let coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } 
            else {
                content.style.display = "block";
            }
        });
    }
};

// This function runs when the publications page is loaded.
let makeList = async () => {
    // parse the data file
    let arr = await parseJSON(pubDataFile);
    
    // prints to console for debugging
    printArray(arr);

    // build the html string
    str = buildString(arr);

    // write the html string to the page
    writeHTML(str);

    // Re-render MathJax for dynamically added content
    if (window.MathJax) {
        MathJax.typesetPromise(); // Re-renders all math on the page
    }

    // adds listeners so links and abstract fields can be
    // expanded and collapsed
    collapseListeners();
}
