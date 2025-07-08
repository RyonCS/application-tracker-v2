# job-application-tracker-v2

A full-stack web application that helps users track their job applications, built with:

- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- EJS (Server-Side Rendering)

---

## Features

- ✅ User authentication (login, register, logout) with Passport.js
- ✅ Track job applications by company, position, location, date, status, and work mode
- ✅ Filter, sort, and search applications
- ✅ EJS-based server-rendered views
- ✅ PostgreSQL + Prisma for data management
- ✅ Session handling with secure cookie storage
- ✅ Fully written in TypeScript with strong type safety

---

## Technologies Used

| Category        | Tech Stack                    |
|----------------|-------------------------------|
| Language        | TypeScript                    |
| Backend         | Express.js                    |
| ORM             | Prisma                        |
| Database        | PostgreSQL                    |
| Auth            | Passport.js, express-session  |
| Views           | EJS Templates                 |
| Styling         | Custom CSS / Bootstrap (opt)  |
| Hosting         | [Render.com](https://render.com) |

## 🔐 Security Notes

- Sessions are stored in PostgreSQL and signed with SESSION_SECRET.
- Routes are protected via Passport session middleware.
- Input validation and enum normalization implemented server-side.

  

Copyright © 2025 Ryon Sajnovsky (RyonCS)
All rights reserved.
