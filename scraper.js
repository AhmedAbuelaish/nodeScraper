const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
// const random = require('random')
// const async = require('async')
const pgpromise = require('pg-promise')()

// Creates the config. user can be anything
const config = {
    host: 'localhost',
    port: 5432,
    database: 'music', // <-------------- update to current db name
    user: 'postgres'
}

const db = pgpromise(config)

const keyword = process.argv[2] // <------------- use '%' instead of 'space'
const fileCommand = process.argv[3] // <------------- use 'append' to add to the file instead of overwriting

const scrapeURL = `https://www.bing.com/images/search?q=${keyword}&FORM=HDRSC2`
const divClass = `img`


// Run the scraper function
getData()

// Scraper function
function getData(){
    // Returns an array of data items
    console.log(`[Requesting...]`, scrapeURL)

    request(scrapeURL, (error,response,html) =>{
        if(!error && response.statusCode == 200) {

            const $ = cheerio.load(html)
            // console.log(html)

            const dataArray = []
            // console.log($(divClass).html())
            $(divClass).each(function (i,el) {
                // var dataItem = $(el).html()
                var dataItem = $(el).attr('src')

                // ~~~~~~~~~~STRING MODIFIER~~~~~~~~~~~~~~~~~~
                // Modify the string -- Replace \n with ''
                // dataItem = dataItem.replace(/\n/gi, ``);

                // Push the string into the array
                if(i!=0){
                    // dataArray.push(`('`+dataItem+`')`)
                    dataArray.push(`<img src="${dataItem}">`)
                }
            })
            const dataString = dataArray.join(' ').toString()
            // console.log(dataString)

            // writeToDB(dataString)
            writeToFile(dataString)
        
        }
    })     
}

// DB write function -- includes postgres query
function writeToDB (stringToWrite) {
    const query = `
        INSERT INTO music (name)
            VALUES ${stringToWrite};`

    db.query(query)
        .then(function (results){
            console.log(results)
        })
}

// Write to file in current directory
const fileName = 'index.html'

function writeToFile (stringToWrite) {
    if (fileCommand=='append') {
        fs.appendFile(fileName, stringToWrite, 'utf8', (err) =>{
            if (err) {
                return console.log(err)
              }
            console.log(`[Appended] ${keyword} data into ${fileName}`)
        })
    } else {
        fs.writeFile(fileName, stringToWrite, 'utf8', (err) =>{
            if (err) {
                return console.log(err)
            }
            console.log(`[Saved] ${keyword} data into ${fileName}`)
        })
    }
}