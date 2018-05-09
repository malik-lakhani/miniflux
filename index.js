const request = require('request');
const csv = require("fast-csv");
const fs = require('fs');

const result = require('dotenv').config()

if (result.error) {
  throw result.error
}

const baseUrl = process.env.BASE_URL;
const apiVersion = process.env.API_VERSION;
const user = process.env.USERNAME;
const password = process.env.PASSWORD;

const regexPattern = process.argv[2] || '';

const getAllFeeds = () => {
  return new Promise((resolve) => {
    request.get(`${baseUrl}/${apiVersion}/feeds`, {
      'auth': {
        'user': user,
        'pass': password,
      }
    }, function(err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(JSON.parse(res.body));
    });
  })
}
const getMatchedFeeds = (pattern) => {
  const regex = new RegExp(pattern,"i")
  return getAllFeeds()
  .then((feeds) => {
    let matchedFeeds = feeds.filter((feed) => {
      return ((feed.title && feed.title.match(regex)) || (feed.description && feed.description.match(regex)))
    }).map((feed) => {
      let matchedWords = [];
      feed.title && feed.title.match(regex) ? matchedWords.push(feed.title.match(regex)[0]) : undefined;
      feed.description && feed.description.match(regex) ? matchedWords.push(feed.description.match(regex)[0]) : undefined;
      return {
        title: feed.title,
        feed_url: feed.feed_url,
        matched_words: matchedWords ? matchedWords[0].toString() : ''
      }
    })
    return matchedFeeds;
  })

}

const writeToCsv = (totalFeeds) => {
  return new Promise((resolve, reject) => {
    csv
    .writeToStream(
      fs.createWriteStream(`${new Date().toISOString().slice(0,10)}.csv`),
      totalFeeds,
      {
        headers: true
      }
    )
    .on("finish", () => {
      resolve({ status: 'done' });
    })
    .on("error", () => {
      reject(error);
    })
  })
}

getMatchedFeeds(regexPattern)
.then((filteredFeeds) => {
  if (!filteredFeeds || !filteredFeeds.length) {
    return { status: 'No feeds to write in CSV.'}
  } else {
    return writeToCsv(filteredFeeds)
  }
})
.then((response) => {
  console.log(response);
})
.catch((err) => {
  console.log(err);
})