# One Piece Trading Card Game (OPTCG) Website
A web-based card browser for the One Piece Trading Card Game. This project focuses on high-performance data rendering and a clean, modern user interface.

## Project Context
Developed by **Johnson Hwang**. This project serves as a practical application of front-end architecture, data structures, and automated deployment workflows.

## Key Features
* **Dynamic Card Display:** Uses Vanilla JavaScript to fetch data from `optcgapi.com`, populating the scrollable card container in real-time.
* **Responsive Layout:** Implements a hybrid layout using CSS Grid for high-level page architecture and Flexbox for component-level alignment.
* **Resizable Interface:** Features a custom-built "resizer" component that allows users to adjust the ratio between the card list and preview pane.
* **Clean Routing:** Utilizes Vercel's routing engine to strip `.html` extensions, providing a cleaner and more intuitive user navigation experience.

## Tech Stack
* **Frontend:** HTML, CSS (Grid and Flexbox), and Vanilla JavaScript.
* **Deployment:** Hosted on Vercel with custom routing and clean URLs.
* **Optimization:** Vercel speed insights for real-time performance monitoring.

## Architecture
```text
├── src/                # core application source code
│   ├── assets/         # static resources
│   │   ├── js/         # application logic
│   │   ├── css/        # stylesheets
│   │   └── images/     # UI graphics
│   ├── index.html      # home page
│   ├── news.html       # news page
│   ├── about.html      # about page
│   └── contact.html    # contact page
├── CHANGELOG.md        # version history and feature tracking
├── package.json        # project metadata and dependencies
└── vercel.json         # routing and rewrite configuration
```

## Project History
For a detailed history of features, bug fixes, and other changes, please refer to the [CHANGELOG.md](./CHANGELOG.md).
