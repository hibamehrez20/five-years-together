# 5 Years Together ♥ — Gift Website

A romantic anniversary site you can send to your partner as a surprise gift.

## Before you gift it — quick checklist

1. **Your song (optional)** — Drop your MP3 into `music/our-song.mp3` and edit the song name in `translations.js` under `music.songTitle` and `music.songArtist` (English + Arabic).
2. **Read the letters** — Personalize text in `translations.js`:
   - `letter.paragraphs` — main “Open My Heart” letter
   - `party.lines` — surprise party card message
3. **Timeline** — Edit `timeline.items` in `translations.js` if any dates need changing.
4. **Test on your phone** — Open the site on mobile; scroll to **Surprise**, tap the 💌 card, try **عربي** if he reads Arabic.
5. **Live chat (optional)** — Set up Firebase so you and Omar can message each other on the site (see below).
6. **Put it online** — He needs a **link**, not a file on your laptop (see below).

## How to send it as a gift (free link)

Deploy on **Render** (free static site):

1. Push this folder to a **GitHub** repository.
2. Go to [https://dashboard.render.com](https://dashboard.render.com) → sign up / log in.
3. Click **New +** → **Static Site**.
4. Connect your GitHub account and select the repo.
5. Render reads `render.yaml` automatically — click **Create Static Site**.
6. Wait ~1–2 minutes — you get a link like `https://five-years-together.onrender.com`
7. (Optional) In Render → **Settings** → change the site name to something cute.

**Other free options:** Vercel, Cloudflare Pages, GitHub Pages — same idea: connect the repo, share the URL.

## Cute ways to give him the link

**Text message:**
> Happy 5 years, my love ♥ I made something for you — open this when you're alone: [your link]

**WhatsApp:** Send the link — the preview will show *“5 Years Together ♥”* and *“Someone made something special for you.”*

**QR code:** Generate a QR at [https://qr.io](https://qr.io) pointing to your link. Print it or put it inside a card.

**In person:** “Scroll all the way down… there's a surprise party waiting for you.”

## What's inside the gift

- Live counter since **June 7, 2021**
- Photo & video gallery with messages on each photo
- 100 reasons I love you (English + Arabic)
- Timeline of your story
- **Surprise party** — fireworks when he reaches it, tap the card on the table for your letter
- **Open My Heart** — full love letter anytime from the nav
- **Our Chat** — live messages between you and Omar (after Firebase setup)

## Live chat setup (one time, ~15 min)

Lets you and Omar send messages to each other on the site. Messages are saved forever.

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create a project**
2. **Build** → **Realtime Database** → **Create database** → pick a region → **Start in test mode**
3. **Project settings** (gear) → **Your apps** → **Web** `</>` → register app → copy the `firebaseConfig` object
4. Paste the values into `firebase-config.js` (replace the `YOUR_...` placeholders)
5. **Realtime Database** → **Rules** → paste everything from `firebase-database.rules.json`  
   - If you changed `CHAT_ROOM_SECRET` in `firebase-config.js`, update the room name in the rules too
6. Push to GitHub — Render redeploys automatically

**How you use it:** Open the site → passcode → **Our Chat** → tap **I'm Omar** or **I'm Hiba** → type and send. The other person sees it live when they open the same page.

**Privacy:** The site passcode + private room id keep it for you two. Don't share the link publicly.

## Language

Click **عربي** / **EN** in the nav. Choice is saved automatically.

## Add more photos or videos later

1. Put new files in `photos/` or `videos/`
2. Regenerate the gallery list (or ask Cursor to update `gallery-data.js`)

## Open locally (for testing only)

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` — this is for you to preview, not for gifting (he can't open your localhost).

---

Made with love. He’s going to melt. ♥
