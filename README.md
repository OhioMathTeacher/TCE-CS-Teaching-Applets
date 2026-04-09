# TCE CS Teaching Applets

This repository hosts the public static demo site for the bridge-course applets.

## 🚀 [Launch the Applets](https://OhioMathTeacher.github.io/TCE-CS-Teaching-Applets/)

## Included Applets

1. `Binary Media Lab`
   - text to binary
   - 8x8 pixel image to binary and hex
   - pseudocode and simple Java views

2. `Algorithm Builder`
   - draggable “popsicle stick” sequencing tasks
   - editable blank sticks for missing steps
   - live `ToddGPT` chat rail through OpenRouter
   - pseudocode and simple Java views

## Why This Helps The Meeting

The point is not just the applets themselves.

The point is to show how students in `TCE/CSE 3XX` could:

1. learn a concept visually or interactively,
2. examine the logic in pseudocode,
3. see a readable Java version,
4. build or revise a similar teaching tool agentically,
5. use the tool as a classroom artifact or assignment.

## How To Use

Open the site in a browser. ToddGPT can run directly from the page with a runtime OpenRouter key.

```bash
cd TCE-CS-Teaching-Applets
python3 -m http.server 8124
```

Then open `http://127.0.0.1:8124`.

Use the `Set API Key` button in the ToddGPT rail to enter the key at runtime.
The key is stored only in the current browser session, not in the HTML or frontend source files.

If no key has been configured, ToddGPT will prompt for one before sending live requests.

## GitHub Pages

This repo is intended to be published directly with GitHub Pages from the `main` branch root.

## Good Talking Points

1. The `Binary Media Lab` shows how abstract CS content can become concrete without turning into a full programming course.
2. The `Algorithm Builder` shows how students can move from procedures to pseudocode to simple Java.
3. Both applets fit the idea of a bridge course that reduces fear before `CSE 174`.
4. Both are examples of applets students could help design or build agentically during the course.
