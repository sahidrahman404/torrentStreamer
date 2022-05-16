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
    {
      type: 'list',
      name: 'quality',
      message: 'What resolution do you prefer to stream the video in?',
      choices: ['480p', '720p', '1080p'],
      default: '720p',
    },
  ])
  .then(answers => {
    // Use user feedback for... whatever!!
    console.log(answers);
  });
