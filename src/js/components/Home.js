import { select, templates } from '../settings.js';

class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initCarousel();
  }

  render(element){
    const thisHome = this;

    const generatedHTML = templates.homePage(element);

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.wrapper.carouselWidget = thisHome.dom.wrapper.querySelector(select.widgets.carousel.wrapper);
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
}

export default Home;