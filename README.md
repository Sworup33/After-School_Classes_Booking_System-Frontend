# After-School Classes Booking System (Frontend)

Live: https://sworup33.github.io/After-School_Classes_Booking_System-Frontend/

## Run Locally
```bash
python -m http.server 8080
```
Open http://localhost:8080

## Configure Backend API
Edit `main.js` and set `apiUrl` to your backend:
- Local: `http://localhost:3000`
- Prod: `https://after-school-classes-booking-system.onrender.com`

Tip: For quick testing without editing code, set an override in the browser console:
```js
localStorage.setItem('apiUrl', 'http://localhost:3000')
```

## Tech
- Vue 3 (CDN), Bootstrap 5, Fetch API

## Features
- Browse, sort, search lessons
- Add to cart, remove items
- Validate name (letters) & phone (digits)
- Responsive UI
