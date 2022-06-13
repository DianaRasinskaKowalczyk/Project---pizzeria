import { select, templates } from '../settings.js';
// import {app} from '../app.js';

class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initCarousel();
    thisHome.initLink();
  }

  render(element){
    const thisHome = this;

    const generatedHTML = templates.homePage(element);

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.wrapper.carouselWidget = thisHome.dom.wrapper.querySelector(select.widgets.carousel.wrapper);
    thisHome.dom.wrapper.onlineOrder = thisHome.dom.wrapper.querySelector(select.home.onlineOrder);
    thisHome.dom.wrapper.bookTable = thisHome.dom.wrapper.querySelector(select.home.bookTable);
  }

  initCarousel(){

    const elem = document.querySelector('.main-carousel');
        const flkty = new Flickity(elem, { // eslint-disable-line
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
      wrapAround: true,
      prevNextButtons: false,
    });
  }

  initLink(){
    const thisHome = this;
    thisHome.dom.wrapper.onlineOrder.addEventListener('click', function(){
      thisHome.activatePage('order');
      window.location.hash = '#/' +'/order';
    });

    thisHome.dom.wrapper.bookTable.addEventListener('click', function(){
      thisHome.activatePage('booking');
      window.location.hash = '#/' + '/booking';
    });
  }
}

export default Home;