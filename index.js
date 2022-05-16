'use strict';

import inquirer from 'inquirer';
import puppeteer from 'puppeteer';

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

        result.push({ title, seeder, size });
      });
      return result;
    });

    console.log(torrents);

    await browser.close();
  }

  start();
});
