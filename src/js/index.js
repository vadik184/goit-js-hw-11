import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { fetchImg } from './api';
const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  button: document.querySelector('.submit'),
};
const { searchForm, gallery, button } = refs;
const perPage = 40;

let isEnd = false;
let searchValue = '';
let page = 1;
let lightbox = {};

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(handlerObserver, options);

const target = document.querySelector('#target');
searchForm.addEventListener('submit', onSubmit);
async function onSubmit(e) {
  e.preventDefault();

  isEnd = false;

  searchValue = e.currentTarget.elements.searchQuery.value;
  page = 1;

  if (searchValue.trim() === '') {
    Notiflix.Notify.info('Please enter text');
    return;
  }
  try {
    const cardData = await fetchImg(searchValue, page);

    if (cardData.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      gallery.innerHTML = '';
      return;
    }

    gallery.innerHTML = createMarkup(cardData.hits);

    Notiflix.Notify.info(`Hooray! We found ${cardData.totalHits} images.`);
    if (!isEnd) {
      observer.observe(target);
    }
  } catch {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
  });
}
async function handlerObserver(entries, observer) {
  entries.forEach(async entry => {
    if (!entry.isIntersecting || isEnd) {
      return;
    }

    page += 1;

    if (!isEnd) {
      const cardData = await fetchImg(searchValue, page);

      gallery.insertAdjacentHTML('beforeend', createMarkup(cardData.hits));

      if (page * perPage >= cardData.totalHits) {
        isEnd = true;
        observer.unobserve(target);
      }
    } else {
      Notiflix.Notify.info("We're reached the end of search results");
    }

    lightbox.refresh();
  });
}
function createMarkup(data) {
  return data.map(cardInfo).join('');
}

function cardInfo({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <div class="photo-card">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width= "300" height= "200"/>
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes - ${likes}</b>
        </p>
        <p class="info-item">
          <b>Views - ${views}</b>
        </p>
        <p class="info-item">
          <b>Comments - ${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads - ${downloads}</b>
        </p>
      </div>
    </div>`;
}
