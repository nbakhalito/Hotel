import { getGallery } from './data.js';

const filters = document.querySelector('#gallery-filters');
const grid = document.querySelector('#gallery-grid');
let images = [];
let selectedCategory = 'All';

function renderFilters() {
  const categories = ['All', ...new Set(images.map((image) => image.category))];
  filters.innerHTML = categories.map((category) => `
    <button data-filter="${category}" class="rounded-full px-5 py-2 text-sm font-semibold ${selectedCategory === category ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'}" type="button">${category}</button>`).join('');
  filters.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter;
    renderFilters();
    renderGrid();
  }));
}

function openLightbox(imageIndex) {
  let currentIndex = imageIndex;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  document.body.append(modal);

  const render = () => {
    const image = images[currentIndex];
    modal.innerHTML = `<div class="relative w-full max-w-5xl"><button data-close class="absolute right-2 top-2 z-10 rounded-full bg-white px-3 py-1 text-2xl" aria-label="Close" type="button">×</button><img src="${image.image_url}" alt="${image.title}" class="max-h-[80vh] w-full rounded-xl object-contain"><p class="mt-3 text-center text-white">${image.title}</p><button data-previous class="absolute left-2 top-1/2 rounded-full bg-white px-4 py-2 text-xl" type="button" aria-label="Previous image">‹</button><button data-next class="absolute right-2 top-1/2 rounded-full bg-white px-4 py-2 text-xl" type="button" aria-label="Next image">›</button></div>`;
    modal.querySelector('[data-close]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-previous]').addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; render(); });
    modal.querySelector('[data-next]').addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; render(); });
  };
  render();
}

function renderGrid() {
  const visibleImages = images.filter((image) => selectedCategory === 'All' || image.category === selectedCategory);
  grid.innerHTML = visibleImages.map((image) => {
    const index = images.indexOf(image);
    return `<button data-image-index="${index}" class="img-zoom overflow-hidden rounded-xl text-left" type="button"><img src="${image.image_url}" alt="${image.title}" class="h-56 w-full object-cover md:h-80"><span class="block bg-white px-3 py-3 text-sm font-medium">${image.title}</span></button>`;
  }).join('');
  grid.querySelectorAll('[data-image-index]').forEach((button) => button.addEventListener('click', () => openLightbox(Number(button.dataset.imageIndex))));
}

export async function initGallery() {
  images = await getGallery();
  renderFilters();
  renderGrid();
}
