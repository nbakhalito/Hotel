import { getAmenities, getGallery, getReviews, getRooms, getSettings } from './data.js';
import { money } from './app.js';

const heroImages = ['8135492', '7546323', '18285947', '3201921'];
const imageUrl = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800`;

function renderRooms(rooms) {
  document.querySelector('#home-rooms').innerHTML = rooms.slice(0, 3).map((room) => `
    <article class="card-luxury img-zoom">
      <img src="${room.images?.[0] || imageUrl('27164969')}" alt="${room.name}" class="h-64 w-full object-cover">
      <div class="p-6">
        <p class="text-xs uppercase tracking-widest text-amber-600">${room.category}</p>
        <h3 class="mt-2 font-serif text-3xl font-bold">${room.name}</h3>
        <p class="mt-2 text-sm text-stone-600">${room.short_description || room.description}</p>
        <div class="mt-5 flex items-center justify-between"><span class="font-semibold text-stone-900">${money(room.price_per_night)} <small class="font-normal text-stone-500">/ night</small></span><a href="booking.html?room=${room.slug}" class="text-sm font-semibold text-amber-700">Book room →</a></div>
      </div>
    </article>`).join('');
}

function renderAmenities(amenities) {
  document.querySelector('#home-amenities').innerHTML = amenities.slice(0, 6).map((amenity) => `
    <div class="text-center"><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700">✓</div><p class="mt-3 text-sm font-medium">${amenity.name}</p></div>`).join('');
}

function renderGallery(gallery) {
  document.querySelector('#home-gallery').innerHTML = gallery.slice(0, 6).map((item) => `
    <img src="${item.image_url}" alt="${item.title}" class="h-56 w-full rounded-xl object-cover md:h-72">`).join('');
}

function renderReviews(reviews) {
  document.querySelector('#home-reviews').innerHTML = reviews.slice(0, 4).map((review) => `
    <blockquote class="rounded-2xl border border-stone-700 p-7"><div class="text-amber-400">${'★'.repeat(review.rating || 5)}</div><p class="mt-4 leading-relaxed text-stone-300">“${review.review_text}”</p><footer class="mt-5 text-sm font-semibold">${review.first_name}<span class="ml-2 font-normal text-stone-500">${review.room_name || 'Guest'}</span></footer></blockquote>`).join('');
}

function initAvailabilityForm() {
  document.querySelector('#availability-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    location.href = `rooms.html?checkin=${formData.get('checkin')}&checkout=${formData.get('checkout')}&guests=${formData.get('guests')}`;
  });
}

function startHeroSlideshow() {
  let currentImage = 0;
  const hero = document.querySelector('#hero-bg');
  hero.style.backgroundImage = `url('${imageUrl(heroImages[0])}')`;
  setInterval(() => {
    currentImage = (currentImage + 1) % heroImages.length;
    hero.style.backgroundImage = `url('${imageUrl(heroImages[currentImage])}')`;
  }, 6000);
}

export async function initHome() {
  const [rooms, amenities, gallery, reviews, settings] = await Promise.all([
    getRooms(), getAmenities(), getGallery(), getReviews(), getSettings(),
  ]);
  document.querySelector('#hero-headline').textContent = settings.hero_headline || 'Your private escape in the heart of Lagos';
  document.querySelector('#hero-subtext').textContent = settings.hero_subtext || 'Thoughtfully designed short-stay apartments for comfort, privacy, and effortless living.';
  renderRooms(rooms);
  renderAmenities(amenities);
  renderGallery(gallery);
  renderReviews(reviews);
  initAvailabilityForm();
  startHeroSlideshow();
}
