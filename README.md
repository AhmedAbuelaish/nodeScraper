# nodeScraper
nodeScraper is a nodejs app for pulling information from the web and writing it to a file or database.

### Installation
nodeScraper requires [Node.js](https://nodejs.org/) to run.

Once the repo is cloned, install the dependencies and devDependencies.

```sh
$ cd nodeScraper
$ npm install
```

## How To Use Image Search
### Command Line
- keyword: term to search for. *Use '%' instead of space*
- pagenumber: *[optional]* integer
- new/append: *[optional]* use '--new' to overwrite all existing data, or leave blank to default to 'append'
```sh
$ node scraper.js [keyword] [pagenumber: optional] [--new: optional]
```
### Pull Data
Update the URL and div class of the target information. Chain div classes to target a specific child in the div. (e.g. 'parent child img')
```sh
const scrapeURL = `https://www.bing.com/images/search?q=${keyword}&form=HDRSC2&first=${firstImg}&cw=1243&ch=698`
const divClass = `img`
```
Extract the html of the target
```sh
var dataItem = $(el).html()
```
Or extract an attribute from the html (e.g. img src)
```sh
var dataItem = $(el).attr('src')
```
### Modify Data
Use the string modifier function to change the information into html format or into postgres by replacing or adding characters to each element
```sh
dataArrayMod = dataArray.map(stringModifier)
function stringModifier(arrayEl) {
	// Modify the string -- Replace \n with ''
	// return arrayEl.replace(/\n/gi, ``)
	return `<img src="${arrayEl}">`
}
const dataString = dataArrayMod.join(' ').toString()
```
### Write Data
Write to DB by using the writeToDB function. *Update query in the function*
```sh
writeToDB(dataString)
```
Write to file:
- 1st argument: String or array to write.
- 2nd argument: Name of the file in current directory to write to. (Does not have to exist)
```sh
writeToFile(dataString, 'index.html')
```
```sh
writeToFile(dataArray+',', 'data.csv')
```

## Tech
nodeScraper uses a number of open source projects to work properly:

* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [Request] - Simplified HTTP client
* [Cheerio] - Fast, flexible & lean implementation of core jQuery designed specifically for the server.
* [fs] -  An API for interacting with the file system
* [pg-promise] - Promises/A+ interface for PostgreSQL.

**Free Software, Hell Yeah!**
