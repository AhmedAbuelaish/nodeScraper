// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                How To
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Command line:
// node imgSearch.js [keyword] [pagenumber: optional] [--new: optional]
// Keyword: use '%' instead of 'space'
//

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                Dependencies
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const pgpromise = require('pg-promise')()
// const random = require('random')
// const async = require('async')

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      DB
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Creates the config. user can be anything
const config = {
	host: 'localhost',
	port: 5432,
	database: 'picturesdb', // <-------------- update to current db name
	user: 'postgres'
}
const db = pgpromise(config)

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//            Node Command Line Inputs
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const keyword = process.argv[2] // <------------- use '%' instead of 'space'
var pageNumber = process.argv[3] // <-------------- default = 1
var fileCommand = process.argv[4] // <------------- use '--new' to erase previous results and replace
var firstImg = 1
var imgNumber = 1
// check if optional argument 3 exists
if (isNaN(process.argv[3])) {
	pageNumber = 1
	fileCommand = process.argv[3]
}
// if (pageNumber) {
// 	firstImg = (pageNumber - 1) * 30 + 1
// }

for (var i=1;i<=pageNumber;i++){
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                Scraping Target
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// const scrapeURL = `https://www.bing.com/images/search?q=${keyword}&FORM=HDRSC2`
const scrapeURL = `https://www.bing.com/images/search?q=${keyword}&form=HDRSC2&first=${imgNumber}&cw=1243&ch=698`
const divClass = `img`

imgNumber = i*30

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                    Scraper
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Run the scraper function
getData()

// Scraper function
function getData() {
	// Returns an array of data items
	console.log(`[Requesting...]`, scrapeURL)

	request(scrapeURL, (error, response, html) => {
		if (!error && response.statusCode == 200) {
			const $ = cheerio.load(html)
			const dataArray = []
			var dataArrayMod = []

			$(divClass).each(function(i, el) {
				// var dataItem = $(el).html()
				var dataItem = $(el).attr('src')

				// Push the result into an array
				if (i != 0) {
					// dataArray.push(`('`+dataItem+`')`)
					// dataArray.push(`<img src="${dataItem}">`)
					dataArray.push(dataItem)
				}
			})

			// ~~~~~~~~~~STRING MODIFIER~~~~~~~~~~~~~~~~~~
			dataArrayMod = dataArray.map(stringModifier)
			function stringModifier(arrayEl) {
				// Modify the string -- Replace \n with ''
				// return arrayEl.replace(/\n/gi, ``)
				return `<img src="${arrayEl}">`
			}
			const dataString = dataArrayMod.join(' ').toString()

			// ~~~~~~~~~~SAVE DATA OPTIONS~~~~~~~~~~~~~~~~~~
			// writeToDB(dataString)
			writeToFile(dataString, 'data/index.html')
			writeToFile(dataArray+',', 'data/data.csv')
		}
	})
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                 DB Functions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DB write function -- includes postgres query
function writeToDB(stringToWrite) {
	const query = `
        INSERT INTO music (name)
            VALUES ${stringToWrite};`

	db.query(query).then(function(results) {
		console.log(results)
	})
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                File Functions
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function writeToFile(dataToWrite, fileName) {
	if (fileCommand == '--new') {
		fs.writeFile(fileName, dataToWrite, err => {
			if (err) {
				return console.log(err)
			}
			console.log(`[Saved] ${keyword} data into ${fileName}`)
		})
	} else {
		fs.appendFile(fileName, dataToWrite, err => {
			if (err) {
				return console.log(err)
			}
			console.log(`[Appended] ${keyword} data into ${fileName}`)
		})
	}
}

// End for loop
}