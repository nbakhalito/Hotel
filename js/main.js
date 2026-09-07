/*
  L-Rina Apartment - single JavaScript entry point
  ------------------------------------------------
  Every HTML page loads this file. The page name decides which feature starts.
  Shared layout, data, and feature code stay in small modules so this file
  remains easy to read and the website remains easy to maintain.
*/

import './app.js';
import { initHome } from './home.js';
import { initRooms } from './rooms.js';
import { initBooking } from './booking.js';
import { initOrdering } from './ordering.js';
import { initGallery } from './gallery.js';
import { initAbout, initContact, initLookup } from './secondary.js';
import { initAdmin } from './admin.js';

const page = document.body.dataset.page || 'home';

const pageInitializers = {
  home: initHome,
  rooms: initRooms,
  booking: initBooking,
  order: initOrdering,
  gallery: initGallery,
  about: initAbout,
  contact: initContact,
  'my-booking': () => initLookup('booking'),
  'order-track': () => initLookup('order'),
  admin: initAdmin,
};

const initializePage = pageInitializers[page];

if (initializePage) {
  initializePage();
}
