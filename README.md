# Dialed Helper

A [Tampermonkey](https://www.tampermonkey.net/) / [Violentmonkey](https://violentmonkey.github.io/) userscript that helps you play games on [dialed.gg](https://dialed.gg).

Currently supports the **Color** game with full auto-solve and adjustable accuracy modes so your score looks human.

## Features

| Feature | Description |
|---|---|
| **Auto-capture** | Detects and records colors shown during the countdown phase |
| **Set Color** | Moves the HSB sliders to the target color without submitting — you press done when ready |
| **Auto-Solve** | Sets sliders AND auto-submits each round — full hands-free play |
| **Accuracy Modes** | Perfect / Pro / Good / Human — adds controlled noise so scores look natural |
| **Color Memory Panel** | Shows captured colors with hex codes and HSB slider values |
| **Fiber-level integration** | Reads exact target values from the game's React state for 100% accuracy |

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) for your browser
2. **[Click here to install](https://raw.githubusercontent.com/jlaiii/dialed-helper/main/dialed-helper.user.js)** — Tampermonkey will detect it automatically
3. Go to [dialed.gg](https://dialed.gg) and play — the helper panel appears in the bottom-right corner

## Usage

| Action | How |
|---|---|
| Show/hide panel | Click the ◆ button or press `Ctrl+`` ` |
| Toggle auto-capture | Click **Capture** in the panel |
| Set sliders without submit | Click **Set Color** |
| Toggle auto-solve | Click **Auto-Solve** or press `Ctrl+S` |
| Change accuracy | Click **Perfect / Pro / Good / Human** in the panel |

### Accuracy Modes

| Mode | Noise (H/S/B) | Typical Score |
|---|---|---|
| **Perfect** | None | 10/10 |
| **Pro** | ±1° / ±1-2% / ±1-2% | ~9.5-10/10 |
| **Good** | ±4° / ±5% / ±5% | ~8-9/10 |
| **Human** | ±8° / ±10% / ±10% | ~6-8/10 |

## Roadmap

All game modes on [dialed.gg](https://dialed.gg) will be supported:

| Game | Status | Plan |
|---|---|---|
| **Color** | ✅ Supported | Auto-capture + auto-solve + accuracy modes |
| **Sound** | 🔜 Planned | Auto-detect pitch/frequency, auto-match tone |
| **Time** | 🔜 Planned | Auto-detect countdown/timer patterns, auto-recall |
| **Shape** | 🔜 Planned | Auto-detect geometric shape parameters, auto-recreate |

## How It Works

1. **Polls the DOM** for the countdown screen and captures the displayed color (RGB)
2. **Reads React fiber state** to get the exact target HSB values the game expects
3. **Simulates pointer events** on the slider strips to visually set the correct positions
4. **Injects values into the game's internal state** via React fiber to ensure the game registers the correct colors
5. **Submits** via the React `onSubmit` handler (bypasses DOM button issues)
6. Applies **random noise** to HSB values based on the selected accuracy mode

## Files

| File | Description |
|---|---|
| `dialed-helper.user.js` | Main userscript — install this |

## License

MIT
