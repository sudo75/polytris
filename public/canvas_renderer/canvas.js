const callback_function = () => {
    console.log('Default callback: not assigned');
}

import {Menu_Renderer} from 'https://sudo75.github.io/canvas-functions/menu_renderer.js';

/*
const btns = [
    {txt: ['Start'], callback: startGame},
    {txt: ['Standard Rendering'], callback: useStandardRenderer},
    {txt: ['CC1', 'CC2', 'CC3'], callback: callback_function},
];
const menu = new Menu_Renderer('Polytris', 'Canvas Rendering (alpha)', 'v.0.4.0-dev', btns, 300, 600);
menu.init();
*/

function useStandardRenderer() {
    window.location.href = '../index.html';
}

import {Game} from './game.js';

init();
function init() {
    const game = new Game(300, 600);
    game.init();
}