# MiniMax Music 3 Prompt Helper

English | [日本語](README.ja.md)

An unofficial browser-based helper for building structured music captions and tagged lyrics for use with MiniMax Music 3 in ComfyUI workflows.

The app turns a short musical idea into two reusable fields:

- `caption`: a structured description containing Global Metadata, Vocal Details, and Arrangement
- `lyrics`: lyrics with section tags such as `[intro]`, `[verse]`, and `[chorus]`

It can also download both fields as a small prompt JSON file.

> This is an independent community project by [@uekiy](https://github.com/uekiy). It is not affiliated with, endorsed by, or supported by MiniMax or ComfyUI.

![MiniMax Music 3 Prompt Helper screenshot](docs/screenshot.png)

*The parameter editor with genre, mood, vocal, and lyric-tag suggestions.*

## Features

- Genre, mood, and vocal suggestion buttons
- Lyric section tag insertion
- Prompt rewriting through Gemini, OpenAI, or Anthropic
- Structured caption and formatted lyric output
- One-click copying
- Prompt JSON download for transferring values into a ComfyUI workflow
- Optional per-browser API-key storage
- No build process or package installation

See the [English tag reference](tags_reference.md) or [Japanese tag reference](tags_reference.ja.md) for descriptions of the built-in suggestions.

## Requirements

- A modern desktop browser
- An API key for at least one supported provider
- Internet access for the selected API and the Inter font loaded from Google Fonts

The provider model names and API availability may change over time. Browser requests can also be affected by provider CORS policies and account settings.

## Run locally

Download or clone this repository, open a terminal in the project folder, and start a local web server. For example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Opening `index.html` directly may work in some browsers, but a local HTTP server is recommended for consistent browser behavior.

## Usage

1. Enter a genre/style, mood, vocal description, and optional tagged lyrics.
2. Use the suggestion buttons to add useful terms.
3. Choose Gemini, OpenAI, or Anthropic.
4. Enter the API key for that provider.
5. Enable **Remember this key in this browser** only on a trusted device if desired.
6. Select **Generate Prompt**.
7. Copy the caption and lyrics into the corresponding inputs in your ComfyUI MiniMax Music 3 workflow, or download the prompt JSON.

Example output:

```json
{
  "caption": "Global Metadata: ...\nVocal Details: ...\nArrangement: ...",
  "lyrics": "[intro]\n[verse]\n...\n[chorus]\n..."
}
```

The downloaded file is prompt data containing `caption` and `lyrics`. It is not a complete ComfyUI workflow JSON file.

## API key and privacy notes

- API requests are sent directly from your browser to the provider you select.
- Your musical inputs and lyrics are included in those requests.
- API keys are not included in the downloaded prompt JSON.
- By default, the app does not persist a newly entered API key.
- If you enable **Remember this key in this browser**, the key is stored in browser `localStorage`. It is not encrypted.
- Use restricted keys where supported, use the app only on a trusted device, and clear saved keys when finished.
- Select **Clear saved API keys** to remove all provider keys stored by this app in the current browser profile.

Review the selected provider's terms, privacy policy, pricing, and key-management guidance before use.

## MiniMax Music 3 prompt structure

The helper follows the three-part Structured Caption approach described by the MiniMax Music 3 project:

- **Global Metadata**: genre, mood, tempo, instruments, and production character
- **Vocal Details**: vocal presence, register, timbre, delivery, and emotional tone
- **Arrangement**: section-by-section musical development

Lyrics and tags remain in the separate `lyrics` field. For the model guide and its more extensive caption-rewriter resources, see the [official MiniMax Music 3 repository](https://github.com/MiniMax-AI/MiniMax-Music3).

## Limitations

- Generated descriptions are suggestions and may require editing.
- Provider APIs and model identifiers can change independently of this project.
- Direct browser API access may not work for every provider, browser, region, or account configuration.
- This app does not run MiniMax Music 3 or ComfyUI itself.
- The downloaded JSON does not automatically install or modify a ComfyUI workflow.

## Project files

```text
index.html               App interface
style.css                App styling
script.js                UI, provider calls, and JSON export
README.md                English documentation
README.ja.md             Japanese documentation
tags_reference.md        English tag reference
tags_reference.ja.md     Japanese tag reference
LICENSE                  MIT License
```

## Credits

- [MiniMax Music 3](https://github.com/MiniMax-AI/MiniMax-Music3)
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI)

MiniMax, ComfyUI, Google, Gemini, OpenAI, ChatGPT, Anthropic, and Claude are trademarks or names of their respective owners. Their mention does not imply endorsement.

## License

Copyright (c) 2026 uekiy

Released under the [MIT License](LICENSE).
