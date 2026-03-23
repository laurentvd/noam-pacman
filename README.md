# Pac-Man

A fully playable Pac-Man game created by a 9-year-old as an experiment in using AI to bring your imagination to life.

## The Story

This game was made by Noam (9 years old) who designed and drew all the game assets by hand — Pac-Man, the ghosts, the dots — with markers and paper. He then used AI as a tool to turn those drawings into a working game, describing what he wanted the game to do and how it should feel. The sounds, the music, the bomb mechanic, the maze layout — it all came from his imagination. AI helped him build it.

It's an experiment in what happens when a kid with a clear vision gets access to the right tools. No prior coding experience needed — just ideas and determination.

## The Game

Classic Pac-Man with a twist:

- **Hand-drawn sprites** — every character and item was drawn on paper, photographed, and processed into game assets
- **Original soundtrack** — a procedurally generated bass-line loop with kick drums, hi-hats, and snares, all built with the Web Audio API
- **Sound effects** — chomps, power-ups, ghost eating, death, and victory jingles, all synthesized in-browser
- **Bombs** — Noam's own addition to the formula: press Space to drop a bomb that explodes after a few seconds, taking out any ghosts in a 3-tile radius (with screen shake!)
- **Power pellets** — eat one to turn the tables on the ghosts
- **Wrap-around tunnels** — escape through the sides of the maze

### Controls

- **Arrow keys / WASD** — Move
- **Space** — Drop a bomb. It explodes after a few seconds and takes out any ghosts caught in the blast radius

## Play It

You can play the game right in your browser — no install needed:

**https://laurentvd.github.io/noam-pacman/**

Press any arrow key or WASD to start — the music kicks in on the first keypress.

## Run It Locally

No build tools, no dependencies, no install. Just a browser.

1. Clone the repo:
   ```
   git clone https://github.com/laurentvd/noam-pacman.git
   cd noam-pacman
   ```

2. Open `index.html` in your browser. You can either:
   - Double-click `index.html` in your file explorer
   - Or serve it locally (recommended to avoid potential CORS issues with image loading):
     ```
     npx serve .
     ```
     Then open http://localhost:3000

## Project Structure

```
index.html          -- Game page
game.js             -- All game logic (rendering, physics, sound, AI)
assets/
  pacman-open.png   -- Pac-Man with mouth open (hand-drawn)
  pacman-dicht.png  -- Pac-Man with mouth closed (hand-drawn)
  ghost_red.png     -- Red ghost (hand-drawn)
  ghost_blue.png    -- Blue ghost (hand-drawn)
  dot.png           -- Dot pellet (hand-drawn)
  raw/              -- Original photos of the drawings
```

## License

This is a personal project. Feel free to look around and get inspired.
