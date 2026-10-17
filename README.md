# Jonoseba Portal – MERN version

Your Flask project rebuilt with the stack your teacher asked for:

| Layer    | Old (Flask)              | New (MERN)                                   |
|----------|--------------------------|----------------------------------------------|
| Frontend | Jinja + Bootstrap        | **React 18** (Vite) + custom CSS, React Router |
| Backend  | Flask + SQLAlchemy       | **Node.js + Express**                        |
| Database | MySQL                    | **MongoDB** (view it in **MongoDB Compass**) |
| Auth     | plain-text passwords     | **JWT + bcrypt** hashed passwords            |

## 1. Requirements
- Node.js 18+ (https://nodejs.org)
- MongoDB Community Server running locally + MongoDB Compass (https://www.mongodb.com/try/download/community)

## 2. Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run seed                # loads scholarships, shelters, hotlines, donors, admin user
npm run dev                 # API on http://localhost:5000

# Frontend (second terminal)
cd frontend
npm install
npm run dev                 # site on http://localhost:5173
```

Copy `slide1.jpg … slide5.jpg` from your old `static/images` into `frontend/public/images/`.

**MongoDB Compass:** connect to `mongodb://127.0.0.1:27017` and open the `jonoseba_db` database.
Collections: `users, blooddonors/donors, bloodrequests, scholarships, applications, volunteers,
alerts, shelters, hotlines, welfares, volunteerevents`. You can edit alerts, shelters, scholarships
etc. directly in Compass and the website updates.

**Admin login (created by the seed script):** `admin@jonoseba.gov.bd` / `Admin@12345`
(change it in `backend/.env`).

## 3. What's new

- **National Blood Bank link** – the official https://www.bloodbank.org.bd/ link appears on the Health and Blood Donors pages *only after login* (a locked card with a Login button is shown otherwise). Also a button on the citizen dashboard.
- **Scholarships** – live search, category chips, level / country filters, fully-funded & open-only toggles, sort by deadline, **deadline countdown** ("12 days left"), **eligibility finder by GPA**, ❤ **save/bookmark** (stored per user in MongoDB), detail popup with a **per-scholarship application checklist** (progress remembered in the browser). Added Chevening, MEXT, DAAD, CSC.
- **Blood** – compatibility checker, donor search by group/area, "ready to donate (3+ months)" filter, donor registration, donor phone numbers hidden until login, "mark fulfilled" on requests.
- **Disaster alerts** – filter by district and type, alert severity levels, shelter occupancy bars, Google Maps link and call button, links to the official FFWC and BMD sites.
- **Emergency contacts** – live search, copy-number button, added Child Helpline 1098 and National Legal Aid 16430.
- **Welfare programs** – eligibility checker (age/gender/widow/disability) that highlights matching allowances, with direct apply.
- **Volunteer** – join/leave events with live volunteer counters.
- **Relief & service applications** – saved in MongoDB with a tracking ID; relief form uploads evidence (JPG/PNG/PDF ≤ 5 MB).
- **Dashboards** – citizen dashboard shows *your real* applications; admin dashboard shows real stats and lets you approve/reject applications (admin only).
- Bangla / English toggle, Bangla digits, responsive mobile menu, toast notifications.

## 4. Important notes (please read)

- **Sample data:** scholarship deadlines, disaster alerts, shelters, donors and phone numbers in `backend/seed.js` are *demo data*. The pages tell users to verify on official sites. Replace them with real data before presenting it as a real service.
- **Welfare rules:** I set old-age eligibility to men 65+ / women 62+ (your old page said 60/55) and kept your monthly amounts (৳600/500/850). Please double-check against the current Department of Social Services figures.
- **Security:** passwords are hashed, admin accounts cannot be self-registered, and the donor phone numbers are login-only. Before any real deployment, set a strong `JWT_SECRET` and use HTTPS.
- **Not tested here:** I could not run `npm install` / `npm run build` in my environment (no access to the npm registry), so only the backend syntax was checked. If you hit an error on first run, send me the message and I'll fix it.

## 5. Project structure

```
jonoseba-mern/
├── backend/
│   ├── server.js            Express app + MongoDB connection
│   ├── seed.js              demo data + admin user
│   ├── models/index.js      all Mongoose models
│   ├── middleware/auth.js   JWT protect / admin / optional auth
│   └── routes/              auth, blood, scholarships, api (content, events, applications), admin
└── frontend/
    ├── vite.config.js       dev proxy to the API
    └── src/
        ├── App.jsx, main.jsx, styles.css, api.js
        ├── context/         Auth + Language (bn/en)
        ├── components/      Navbar, BloodBankLink, ProtectedRoute, ui helpers
        └── pages/           Home, Services, Health, BloodDonors, Scholarship, DisasterAlerts,
                             EmergencyContacts, ReliefApply, ServiceApply, Volunteer,
                             WelfarePrograms, Login, Register, CitizenDashboard, AdminDashboard
```
