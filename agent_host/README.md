# Brivo Auto-Poster — Host Agent

This folder is what gets installed on **your spare Mac Mini** (or any Mac /
Windows / Linux box on a residential LAN). The agent:

1. Connects out to the Brivo backend over a single secure WebSocket.
   No port forwarding. No proxy. It works behind any home router because the
   host initiates the connection.
2. Drives a **persistent Chromium profile** via Playwright. You log into
   Instagram / X / LinkedIn **once** in that browser; the session stays
   logged in forever.
3. Receives posting jobs from the backend, runs them in the real logged-in
   browser, and reports back success + a screenshot.

## One-click install (macOS)

Open Terminal and run:

```bash
curl -fsSL https://brivomarketing.com/agent-host/install.sh | bash
```

The installer will:

- Install Homebrew (if missing), Python 3.11, and Playwright Chromium
- Create `~/Library/Application Support/BrivoAgent/` (config + Chromium profile)
- Install a launchd daemon so the agent starts on boot and auto-restarts on crash
- Prompt you for the **6-digit pair code** from the Brivo admin
  dashboard and store the long-lived agent token

After that, open Terminal once and run:

```bash
~/Library/Application\ Support/BrivoAgent/login.sh
```

This launches the persistent Chromium so you can manually log into IG, X,
LinkedIn (and complete any 2FA challenges). You only need to do it once per
account; the cookies live forever in the profile.

## One-click install (Windows)

```powershell
irm https://brivomarketing.com/agent-host/install.ps1 | iex
```

## One-click install (Linux)

```bash
curl -fsSL https://brivomarketing.com/agent-host/install-linux.sh | bash
```

## Anti-sleep (macOS)

The installer also runs:

```bash
sudo pmset -c sleep 0 disksleep 0 womp 1
```

so the Mac never sleeps on power and wakes on AC restore.

## Manual run / debug

```bash
cd ~/Library/Application\ Support/BrivoAgent
./venv/bin/python agent.py --foreground
```
