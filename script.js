// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Contact Form Validation (Main contact form)
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (name && email && message) {
    alert('Thank you, ' + name + '! Your message has been sent.');
    this.reset();
  } else {
    alert('Please fill out all fields.');
  }
});

// Easter Egg elements
const easterEgg = document.getElementById('easter-egg');
const thinkingCloud = document.getElementById('thinking-cloud');
const popupModal = document.getElementById('popup-modal');
const closePopup = document.getElementById('close-popup');
const popupForm = document.getElementById('popup-contact-form');

// Show tooltip after 2 seconds
setTimeout(() => {
  thinkingCloud.classList.add('visible');
}, 2000);

// Clicking the rocket opens the popup and hides tooltip
easterEgg.addEventListener('click', () => {
  popupModal.style.display = 'flex';
  thinkingCloud.classList.remove('visible');
});

// Close popup and show tooltip again
closePopup.addEventListener('click', () => {
  popupModal.style.display = 'none';
  setTimeout(() => {
    thinkingCloud.classList.add('visible');
  }, 300);
});

// Clicking outside popup content closes popup and shows tooltip
window.addEventListener('click', (e) => {
  if (e.target === popupModal) {
    popupModal.style.display = 'none';
    setTimeout(() => {
      thinkingCloud.classList.add('visible');
    }, 300);
  }
});

// Popup form submit handler
popupForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('popup-name').value.trim();
  const email = document.getElementById('popup-email').value.trim();
  const message = document.getElementById('popup-message').value.trim();

  if (name && email && message) {
    alert(`Thanks, ${name}! Your message has been sent. I'll get back to you soon.`);
    popupForm.reset();
    popupModal.style.display = 'none';
    setTimeout(() => {
      thinkingCloud.classList.add('visible');
    }, 300);
  } else {
    alert('Please fill in all fields.');
  }
});

// Starfield Animation setup
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const stars = [];
const numStars = 200;

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.01
  });
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();

    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
  });
  requestAnimationFrame(animateStars);
}
animateStars();


