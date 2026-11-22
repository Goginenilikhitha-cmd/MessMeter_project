MESSMETER – ZERO WASTE MESS HACK
=================================
**Team 28 - MessMeter Project**

**Team Members:**
- Likitha Sri
- Venkatesh 
- Navneeth 

**Project:**
MessMeter - Hostel Mess Management

HOW TO RUN
1. Extract MessMeter_Complete.zip.
2. Open the extracted MessMeter_Complete folder in Visual Studio Code.
3. Open index.html.
4. If you have Live Server installed, right-click index.html and choose "Open with Live Server".
   Otherwise, double-click index.html to open it in your browser.
5. Internet is required for the optional Chart.js chart and Google Fonts. The rest of the app works locally.

FEATURES INCLUDED
- Homepage and navigation
- Today's menu and 7-day weekly menu
- Student meal opt-in / opt-out selection
- Daily headcount predictor (enrolled students minus opt-outs)
- Food waste logging in kilograms
- Dish ratings from 1 to 5 and feedback
- ZeroWaste KPI dashboard with waste chart, totals and dish summaries
- Student and admin demo login forms
- Export demo data as JSON
- Browser localStorage saves demo entries on the same browser/device

IMPORTANT PROJECT LIMITATIONS
- This is a front-end demonstration project. Login forms do not authenticate real accounts.
- Demo data is stored in the browser's localStorage, not a shared database. Different devices/browsers will not share data.
- For real deployment, add a backend (for example Node.js/Express) and a database, and implement secure authentication.
- The 6-hour advance notice is displayed as a reminder; this demo does not enforce a server-side deadline.
- The weekly dishes are sample entries and should be updated to match your hostel menu.

PROJECT FILES
index.html  - page structure
style.css   - design and responsive layout
script.js   - app interactions and browser data storage
README.txt  - setup and project notes
