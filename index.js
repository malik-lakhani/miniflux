const request = require('request-promise');
const csv = require("fast-csv");
const fs = require('fs');
const htmlToText = require('html-to-text');

const result = require('dotenv').config()

if (result.error) {
  throw result.error
}

const baseUrl = process.env.BASE_URL;
const apiVersion = process.env.API_VERSION;
const user = process.env.USERNAME;
const password = process.env.PASSWORD;

const regexPattern = process.argv[2] || /([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})/;

/*
====================================================================================================

return all Feeds entries

====================================================================================================
*/
const getAllFeeds = () => {
  const option = {
    uri: `${baseUrl}/${apiVersion}/feeds`,
    'auth': {
      'user': user,
      'pass': password,
    }
  }
  return request.get(option)
  .then((response) => {
    return JSON.parse(response);
  })
  .then((feedsData) => {
    return Promise.all(feedsData.map((feedTemp) => {
      return getFeedEntries(feedTemp)
    })
  )
  .then((feedEntries) => {
    const flatten = (arr) => {
      return arr.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
      }, []);
    }
      return flatten(feedEntries);
    })
  })
}

/*
====================================================================================================

return all Feeds entries for given feed

====================================================================================================
*/
const getFeedEntries = (feedTemp) => {
  const option = {
    uri: `${baseUrl}/${apiVersion}/feeds/${feedTemp.id}/entries`,
    'auth': {
      'user': user,
      'pass': password,
    }
  }
  return request.get(option)
  .then((response) => {
    return JSON.parse(response).entries;
  })
}

/*
====================================================================================================

return all Feeds entries which match the given pattern.

====================================================================================================
*/
const getMatchedFeeds = (pattern) => {
  const regex = new RegExp(pattern,"i")
  return getAllFeeds()
  .then((feeds) => {
      console.log(feeds)
    let matchedFeeds = feeds.filter((feed) => {
      return ((feed.title && feed.title.match(regex)) || (feed.content && htmlToText.fromString(feed.content).match(regex)))
    }).map((feed) => {
      let matchedWords = [];
      feed.title && feed.title.match(regex) ? matchedWords.push(feed.title.match(regex)[0]) : undefined;
      feed.content && htmlToText.fromString(feed.content).match(regex) ? matchedWords.push(htmlToText.fromString(feed.content).match(regex)[0]) : undefined;
      return {
        title: feed.title,
        feed_url: feed.url,
        matched_words: matchedWords ? matchedWords[0].toString() : ''
      }
    })
    return matchedFeeds;
  })

}

/*
====================================================================================================

Wtite feeds data to csv

====================================================================================================
*/
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

/*
====================================================================================================

Get matched feed entries and write data to csv.

====================================================================================================
*/
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