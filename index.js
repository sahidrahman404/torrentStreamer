'use strict';

import inquirer from 'inquirer';
import puppeteer from 'puppeteer';
import WebTorrent from 'webtorrent-hybrid';
const client = new WebTorrent();

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
        const magnetSelector =
          '.lfecb4006b75614af2c6685e8cce0be1e2ff3b808.l2a4c6cdc6a08118ea01a78cefb9546e14997b78c > li:nth-child(1) > a';

        const magnetLink = await page.$eval(magnetSelector, v =>
          v.getAttribute('href')
        );
        console.log(magnetLink);

        await browser.close();
      }

      downloadMagnet();
    });

    await browser.close();
  }

  start();
});
