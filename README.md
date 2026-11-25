# ByteBusters Scratch Path

10-week First Term Scratch track for Methodist (MHS), Unity (UHS) and Yewa College (YWS).
Kids log in with an access ID (e.g. `UHS-4K7M`); lessons, quiz stars and finished weeks are saved against that ID in your existing Upstash database (all keys start with `bbpath:`, so your other projects are untouched).

## Put it live (about 10 minutes)
1. Create a GitHub repo called `bytebusters-scratch-path` and push this folder (or upload the files).
2. Vercel → Add New Project → pick that repo → Deploy (no build settings needed).
3. Vercel → Project → Settings → Environment Variables. Add:
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (copy from your Upstash database page, "REST API"). If you connect Upstash through Vercel's Storage tab, the `KV_REST_API_URL/TOKEN` names also work.
   - `TRAINER_PIN` = a PIN only you know.
4. Redeploy (Deployments → ⋯ → Redeploy).
5. Open `https://YOUR-SITE.vercel.app/admin`, enter the PIN, press **Load mock IDs**.
6. Open the main site, type `MHS-24MH` and check it opens.

## Replace the mock IDs with real learners
Mock IDs are in `data/ID-CARDS.csv` (40 per school, 120 total). Pick either way:

**A. Keep the mock IDs, add real names (easiest).** Print/hand out the cards, write each child's real name next to an ID. On `/admin` paste lines like `UHS-4K7M,Ade Bello` into "Put real names on the IDs" and press Save. Progress stays with the ID.

**B. Make fresh IDs for real names.** On `/admin` pick the school, paste one name per line, press Make IDs. Then **Print ID cards** (or Download CSV). Delete unused mock IDs with the Delete button.

Lost card? Find the child in the table on `/admin` and read out their ID. A wrong letter gives "Almost! One letter or number is wrong" because the last character of every ID is a check character.

## ID format
`SCHOOL-XXXX`: school code (MHS/UHS/YWS) + 3 random characters + 1 check character. No 0/O/1/I/L. Rebuild IDs with `node scripts/gen-ids.js 40`.

## What the site does
- **Lessons** (10 weeks per school) with Read mode, a Download button and a quick quiz.
- **Play the game** inside the lesson (self-hosted Scratch player, about 4 MB the first time, then cached; games play silently).
- **Did I build it right?** The child picks their saved `.sb3`; the browser compares it with the goal and gives hints. It never blocks finishing a week. Real scripts earn the Variable / If / Loop / Event badges and the Builder badge.
- **Certificate** (Week 10 done) is printable / save as PDF.
- **Parent link**: each child has a private read-only page showing first name, weeks and badges (no ID). Share it from the child's home screen.
- **Offline**: lessons and played games are cached; progress saved offline syncs when the phone is online. Change `VERSION` in `public/sw.js` after editing app files.
- **Trainer page** (`/admin`): class summary, who needs a nudge (quiet 10+ days / never logged in), hardest quiz questions, week-by-week grid, CSV and ID cards.
- **Terms 2 and 3** are full Code Labs (HTML/CSS; JavaScript then PHP). Kids type real code in the page, press Run, and missions tick automatically. Each school gets its own theme (shop, farm stall, small-chops stand). Code is saved to the child's ID.
- Terms 2 and 3 are **locked until you open them** in Admin (Term open/close card).
- PHP runs in "PHP-lite", a small in-browser interpreter that covers the beginner subset (echo, variables, if, loops, arrays, functions, string functions). It was checked against real PHP 8.3 on 16 programs. It does not do databases or forms.

## Notes
- The ID is the only key a learner needs (no password), so keep names to first names. Login is rate limited per IP.
- Test locally with no database: `node test/dev.js` (fake Upstash), then open http://localhost:3111 and /admin (PIN 1234).
- Lessons: `public/data/path.json`. Game checkpoint files: `public/files/` (5 per game: starter, flag-hides, title-play, first-half, finished).


## ByteBusters Studio (projects and puzzles)

- Learners open **/studio** (also linked from the home screen). No ID needed to browse and play; with an ID their stars follow them to any phone.
- **52 projects**: all 15 showcase projects (9 Scratch, 3 Web, 3 Gen AI, with their live links) 13 new international Scratch projects, and 12 **Web Creator** projects, each in small steps with a "Go and ask" mini-research task and a "Make it yours" idea.
- **59 puzzles**: read-the-blocks, put-in-order, find-the-bug and quick quizzes for Scratch, Websites and Gen AI. A new puzzle of the day appears automatically.
- **Scratch checker**: kids pick their saved .sb3 file; the check runs on their device against simple rules (uses a loop, 3+ sprites, etc.).
- **Content Studio** (**/studio-admin**, same TRAINER_PIN): add, edit, hide or undo anything. Your edits are stored in the database and win over the built-in content, so you never edit code.
- Built-in content lives in `public/data/content.json` (made by `content/sp_projects.py` and `content/sp_puzzles.py`).
- Note: the Gen AI and Web showcase entries are guided tours of the live sites with tick-yourself missions. The Scratch Path lessons stay as they are.

### Web Creator (build websites in the browser)
- 12 projects from beginner to pro: HTML (passport page, jollof recipe), CSS (birthday card, Ankara cards, clean-water poster, phone-friendly menu), JavaScript (market calculator, day/night switch, quiz, language greeter, habit tracker) and a portfolio capstone.
- Each opens a live editor with auto-checked missions (the same Code Lab as Terms 2/3). Code and stars save to the child's ID and follow them to any phone.
- In the Content Studio, Web Creator projects can be edited with the "Edit as JSON" button (the `lab` field holds the starter code, answer and mission tests).
- Built from `content/sp_web.py`; run `python3 content/build_studio.py` to rebuild `public/data/content.json`. `test/wc.js` checks that every starter fails and every answer passes.

### Gen AI Prompt Lab (safe, no API key)
- 12 Gen AI projects (Ask Like a Pro, Inflation in Kid Words, Letter to the Chairman, Safe Chat Shield, Study Buddy Coach, and more). Kids write a prompt; a checklist (task, audience, format, local example...) ticks as it gets clearer.
- The "Practice AI" is a **simulator**: the replies are written in advance, and a better prompt gets a better reply. Nothing is sent to any AI service, so it costs nothing and is safe for kids. The screen says so.
- A privacy guard stops prompts containing phone numbers, emails or home addresses.
- 8 "Spot the AI fib" puzzles teach kids to check what AI says.
- Edit any lab in the Content Studio with "Edit as JSON" (field `ai`). Built from `content/sp_ai.py`; `node test/ai.js` checks every example prompt scores full marks.
- Live AI can be added later (it needs an API key and a server function). It is not switched on.

## Real access IDs (Nov 2026)
On `/admin` → **⭐ Paste the real roster**: one learner per line, `Name, School, Track, Class` (commas, or paste straight from Excel/Google Sheets). School = Yewa / Methodist / Unity (codes YWS/MHS/UHS also work). Track = Scratch / Web / GenAI.
1. Press **Check the list** — bad rows are shown in red with the reason; nothing is saved yet.
2. Press **Make IDs** — each learner gets a new ID in the usual format (`YWS-4K7M`, with check character).
3. Filter by school/track, then **Print ID cards** (name, ID, school, class, track and "go to the site and type your ID") or **Download CSV** (now includes Track, Class and Web Dev weeks).
4. Track and class can be changed per child in the All learners table (progress is kept).
5. When everyone has a real ID, **Remove unused mock IDs** deletes only mock IDs that were never used. Until then the mock IDs keep working.
No real names live in this repo — they only exist in your Upstash database.

## Year 2 Web Development track (`/webdev`)
10 short weeks: HTML (weeks 1–3) → CSS (4–5) → JavaScript with the four logic colours (6 events/purple, 7 variables/blue, 8 conditionals/red, 9 loops/green) → week 10 remix-and-showcase. Worked examples are the live Yewa projects: Scam Shield, Harvest Calendar Naija and Apprentice Pathway Explorer.
Each week: goal, "look at a real site", **Go and find out** (one research question for real people), a tiny build with tick-off steps and example code, 3 check questions (2 right to finish), and a "Say it like this" line for judges. The next week opens only when the current one is finished.
Progress saves to the learner's ID under term `wd` (keys `wdw1`–`wdw10`); week 10 earns the `webdev` badge. Works as a guest too (saved on the phone, merged into the ID when they log in) and offline (queued, synced later). Content: `public/data/webdev.json` — edit text there, then bump `VERSION` in `public/sw.js`.

## What's left
- [ ] Paste the real roster for all ~100 learners on `/admin`, print the cards, hand them out
- [ ] Remove unused mock IDs after the first week of real logins
- [ ] Show Web Dev weeks in the admin week-by-week grid (currently in the table and CSV only)
- [ ] Gen AI 10-week track (same pattern as `/webdev`, safety rules first)
- [ ] Trainer edit for `webdev.json` inside the Content Studio
