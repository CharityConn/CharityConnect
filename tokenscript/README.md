# Svelte Project Template

## Development

### Exploring the project directory

- `/tokenscript.xml` defines project's the views, actions and props in correlation with the Svelte application. Each view should be defined inside the `TokenScript.xml` and within the Svelte application.

- `/App.svelte` is an entry point which new views can be added to the Svelte application. 

- `/src/routes/` contains views like `Checkin`.

- `/out/tokenscript.tsml` is the finalised project output. This is generated when you start or build this application. 

### Start 

`pnpm run emulate`

### Build

`pnpm run build`

### Test

Import the output `/out/tokenscript.tsml` file into a supported platform

- [TokenScript Viewer](https://viewer.tokenscript.org/)
- [TokenScript Launch Pad](https://launchpad.smartlayer.network/)
- [Joy.id](https://joy.id/) 
- [AlphaWallet](https://alphawallet.com/)

### Production deployment

1. `pnpm run build:ts:prod`
2. Commit
3. Apply the commit to `prod` branch and push
