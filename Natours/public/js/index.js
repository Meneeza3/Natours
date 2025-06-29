import "@babel/polyfill";
import { login } from "./login";
import { logout } from "./login";
import { displayMap } from "./leaflet";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";
const form = document.querySelector(".form");
const MapPage = document.getElementById("map");
const logOutBtn = document.querySelector(".nav__el--logout");
const updateMe = document.querySelector(".form.form.form-user-data");
const updatePassword = document.querySelector(".form.form-user-password");
const bookBtn = document.getElementById("book-tour");

if (bookBtn) {
  bookBtn.addEventListener("click", async (e) => {
    e.target.textContent = "Processing....";
    const tourId = bookBtn.dataset.tourid;
    await bookTour(tourId);
    e.target.textContent = "Book tour now!";
  });
}
if (updateMe) {
  updateMe.addEventListener("submit", (e) => {
    e.preventDefault();

    // to send form data (files) to the backend
    const form = new FormData();

    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);

    // files => return u an array SO select the first only
    form.append("photo", document.getElementById("photo").files[0]);
    updateSettings(form, "data");
  });
}

if (updatePassword) {
  updatePassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--preSave").textContent = "Updating......";
    const oldPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const newPasswordConfirm = document.getElementById("password-confirm").value;
    await updateSettings({ oldPassword, newPassword, newPasswordConfirm }, "password");

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
    document.querySelector(".btn--preSave").textContent = "SAVE PASSWORD";
  });
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (MapPage) {
  const locations = JSON.parse(MapPage.dataset.locations);
  displayMap(locations);
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}
