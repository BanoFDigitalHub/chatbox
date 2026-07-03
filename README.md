# Private Chat

Sirf 2 logon ke liye private, real-time chat web app. WhatsApp jaisa, lekin sirf tum aur ek dost use kar sakte ho — koi teesra register nahi kar sakta.

## Features

- Real-time text messaging (Socket.io) — dono online hon to bina refresh instant delivery
- Offline delivery — jo bhi msg bheja jaye MongoDB mein save hota hai, doosra banda jab bhi login kare wo mil jata hai
- Photo/video sharing (image lazy-loading ke sath)
- Voice messages — custom minimal player (play/pause, progress bar, duration) recording ke sath
- View-once messages — ek dafa khulne ke baad media hamesha ke liye chala jata hai (server-side enforced, sirf UI trick nahi). Watermark + right-click/long-press-save disabled screenshot ko *deter* karne ke liye — lekin koi bhi browser/OS screenshot ko 100% block nahi kar sakta, ye sirf deterrent hai, guarantee nahi.
- Apni profile picture — dost ko dikhti hai, real-time update hoti hai
- Dost ka custom naam — sirf tumhe dikhta hai (jaise contact rename karna)
- Message reactions ❤️👍😂🔥😮😢 — long-press/hold karke
- Emoji picker — text mein emoji insert karne ke liye
- Chat wallpaper (5 presets) aur theme color (5 presets), dono per-user save hote hain
- Message search (Ctrl/⌘+K)
- Typing indicator
- Skeleton loading + smooth app loader
- Custom 404 page
- Keyboard shortcuts: Enter bhejo, Shift+Enter nayi line, Esc band karo, Ctrl/⌘+K search
- Online / last seen status
- Mobile-first responsive design
- Koi calling feature nahi (jaisa maanga gaya tha)

## Folder structure

```
private-chat-app/
├── server/              Node.js + Express + Socket.io + MongoDB backend
│   ├── server.js
│   ├── config/db.js
│   ├── models/           Message.js, Profile.js
│   ├── middleware/auth.js
│   ├── routes/            auth.js, messages.js, profile.js
│   ├── controllers/      authController.js, messageController.js, profileController.js
│   ├── sockets/chatSocket.js
│   ├── uploads/           uploaded photos/videos/voice notes/avatars (runtime)
│   └── .env.example
└── public/               vanilla HTML/CSS/JS frontend
    ├── index.html        login screen
    ├── chat.html         main chat screen
    ├── 404.html          custom not-found page
    ├── css/style.css
    └── js/login.js, chat.js
```

## Setup (local)

1. **MongoDB Atlas** par free cluster banao (ya koi bhi MongoDB URI use kar lo), connection string copy karo.
2. `server/.env.example` ko `server/.env` naam se copy karo aur fill karo:
   ```
   MONGO_URI=<tumhara MongoDB connection string>
   JWT_SECRET=<koi bhi lamba random string>
   USER1_USERNAME=ubaida
   USER1_PASSWORD=<apna password>
   USER2_USERNAME=dost
   USER2_PASSWORD=<dost ka password>
   ```
3. Install & run:
   ```
   cd server
   npm install
   npm start
   ```
4. Browser mein `http://localhost:5000` kholo. Dono log apne apne credentials se login karein.

## Deploy (Render — jaisa tum pehle use kar chuke ho)

1. Naya **Web Service** banao, repo connect karo, root directory `server` set karo.
2. Build command: `npm install`, Start command: `npm start`.
3. Environment variables dashboard mein wahi values daalo jo `.env` mein hain.
4. **Zaroori:** Render ka disk by default ephemeral hai — restart/redeploy pe `uploads` folder ka data delete ho jata hai (jaisa Elyra project mein pehle face kiya tha). Render dashboard mein ek **Persistent Disk** add karo aur mount path `server/uploads` set karo, warna purani photos/videos/voice notes gayab ho jayengi.
5. Render apne aap HTTPS deta hai — voice recording (mic access) sirf HTTPS ya `localhost` par kaam karta hai, isi liye deploy ke baad hi mic properly test karna, plain HTTP par mic block ho sakta hai.

## Security note

Ye app sirf 2 trusted logon ke liye bana hai, isi liye login simple hai (`.env` mein direct username/password) — koi public signup nahi hai. Ye enterprise-grade security nahi hai, lekin do dost private use ke liye kaafi hai, bas `.env` file kabhi git mein commit mat karna aur credentials kisi teesre ko mat dena.

## Testing

Backend ke saare core flows — login, JWT protection, upload validation, real-time send/receive, view-once double-open prevention, online/offline presence, profile/avatar/nickname, wallpaper/theme save, typing indicator broadcast, message reactions (add/switch/toggle-off), aur custom 404 — **53 automated integration checks** ke sath pass ho chuke hain is sandbox mein (in-memory fake DB ke sath, chunki yahan live MongoDB nahi mil sakta). Real MongoDB Atlas ke sath connect karne ke baad ek dafa khud bhi end-to-end try kar lena.
