'use strict';

import inquirer from 'inquirer';

inquirer
  .prompt([
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
  ])
  .then(answers => {
    // Use user feedback for... whatever!!
    const title = answers.title.toLowerCase().split(' ').join('%20');
    const url = `https://1337x.wtf/category-search/${title}/${answers.category}/1/`;
    console.log(url);
  });
