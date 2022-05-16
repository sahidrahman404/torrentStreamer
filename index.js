'use strict';

import inquirer from 'inquirer';
import puppeteer from 'puppeteer';
import WebTorrent from 'webtorrent-hybrid';
const client = new WebTorrent();
import fs from 'fs';
import cliProgress from 'cli-progress';

let destinationFolder = `/home/rahman/Videos/movies/`;

const questions = [
  /* Pass your questions in here */
  {
    type: 'list',
    name: 'category',
    message: 'Do you wanna watch a movie or a series?',
    choices: ['Movies', 'TV'],
  },
  {
    type: 'input',
    name: 'title',
    message: 'What movie do you wanna watch?',
    validate: answer => {
      if (answer === '') {
        return 'please enter a valid title';
      }
      return true;
    },
  },
];

inquirer.prompt(questions).then(answers => {
  // Use user feedback for... whatever!!
  const title = answers.title.toLowerCase().split(' ').join('%20');
  const url = `https://1337x.wtf/category-search/${title}/${answers.category}/1/`;

  // puppeteer
  async function start() {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(url);

    const torrents = await page.evaluate(() => {
      const titles = document.querySelectorAll('.coll-1.name > a:last-child');
      const seeders = document.querySelectorAll('.seeds');
      const sizes = document.querySelectorAll('.size');

      const result = [];

      titles.forEach((v, i) => {
        const title = v.textContent;
        const seeder = seeders[i].textContent;
        const size = sizes[i].childNodes[0].textContent;
        const link = 'https://1337x.wtf' + v.getAttribute('href');

        result.push([{ title, seeder, size, link }]);
      });
      return result;
    });

    const moviesString = torrents.map(v => {
      return `${v[0].title} \t seeder: ${v[0].seeder} \t size: ${v[0].size}`;
    });

    const movies = {
      type: 'list',
      name: 'movie',
      message: `Choose one of these torrent magnets *tip: choose the most seeded one`,
      choices: moviesString,
    };

    inquirer.prompt(movies).then(answers => {
      const index = moviesString.indexOf(answers.movie);
      const torrentMagnet = torrents[`${index}`][0].link;

      async function downloadMagnet() {
        const browser = await puppeteer.launch({
          headless: true,
        });
        const page = await browser.newPage();
        await page.goto(torrentMagnet);
        console.log(torrentMagnet);

        const magnetSelector = '.no-top-radius .clearfix ul li a';

        await page.waitForSelector(magnetSelector);

        const magnetLink = await page.$eval(magnetSelector, v =>
          v.getAttribute('href')
        );

        console.log(magnetLink);

        // cerate destination folder
        destinationFolder += `${torrents[`${index}`][0].title
          .split(' ')
          .join('_')}/`;
        console.log(destinationFolder);

        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder);
        }

        client.add(magnetLink, torrent => {
          const files = torrent.files;
          let length = files.length;
          console.log('Numbers of files:- \t' + length);

          files.forEach(file => {
            const source = file.createReadStream();
            const destination = fs.createWriteStream(
              destinationFolder + file.name
            );
            source
              .on('end', () => {
                console.log('file: \t\t', file.name);
                length -= 1;
                if (!length) {
                  process.exit();
                }
              })
              .pipe(destination);
          });

          // log progress

          const bar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
          bar.start(100, 0); //full, start

          torrent.on('download', function (bytes) {
            bar.update(torrent.progress * 100);
          });
        });

        await browser.close();
      }

      downloadMagnet();
    });

    await browser.close();
  }

  start();
});
