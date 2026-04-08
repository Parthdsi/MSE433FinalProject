# Coffee Shop Staffing Optimizer

A web-based decision-support tool that uses queueing theory (M/M/s model), discrete-event simulation, and optimization to recommend optimal barista staffing levels for a coffee shop. Built for MSE 433.

## Prerequisites

- **Node.js** version 18 or 20+ ([download here](https://nodejs.org/))
- **npm** (comes with Node.js)

To check if you have them:

```bash
node -v
npm -v
```

## Getting Started

1. **Clone the repo**

```bash
git clone https://github.com/YOUR_USERNAME/MSE433FinalProject.git
cd MSE433FinalProject
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the app**

```bash
npm run dev
```

4. **Open in your browser**

The terminal will show a local URL (usually `http://localhost:5173`). Open that in your browser.

## How to Use

1. **Select a data source** from the sidebar dropdown — pick a day of the week (Monday–Sunday), "Week Average," or "Custom Input" to enter your own numbers.
2. **Adjust cost parameters** if needed (labor cost, revenue per order, penalties). These default to reasonable values.
3. **Click "Optimize Daily Schedule"** (or "Optimize Staffing" in custom mode).
4. **View results** — the main panel shows a summary banner, a bar chart of recommended baristas per hour, a detailed hourly table, and a practical shift plan with financials.
5. **Hover over the (i) icons** next to any metric to see how it's calculated.
