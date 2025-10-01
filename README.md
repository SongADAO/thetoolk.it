# TheToolk.it

TheToolk.it is a multi service video posting service. It supports simultaneous posting to the following services:

- BlueSky
- Facebook
- Farcaster
- Instagram
- Threads
- TikTok (coming soon)
- X (formerly Twitter)
- YouTube

## Self Hosting

If you want to host TheToolk.it yourself you can checkout the project from this git repo, install node.js v22, and run the following commands to run it locally.

All services will work locally by just running the app in dev mode with the exceptions of BlueSky and TikTok which requires `ngrok` to run because localhost urls are not support by their apis.  If you need BlueSky and TikTok support be sure to follow the extra setup steps in the ngrok section below.

If you want to host the app on your own dedicated domain name you can deploy the application to any node.js webhost of your choosing that supports next.js projects. In that case no extra steps are required for BlueSky or TikTok.

### How to Run the Self Hosted Version

1. Checkout the project with git
```
git clone https://github.com/SongADAO/thetoolk.it.git
```

2. Create the secrets file from the template.
```
cp .env.example .env
```

3. Install dependencies
```
npm ci
```

4. Start the application in local dev mode.
```
npm run dev
```

5. Go to the running application's url
Open `http://localhost:3000` in your browser and use the app as you would the hosted version.

### ngrok - BlueSky & TikTok Local Self Hosted Support

To support BlueSky and TikTok when running the app on localhost you will need to install `ngrok` <https://ngrok.com/> .   This will create a public https url at an ngrok domain which is usable by the BlueSky and TikTok apis.

1. Setup your ngrok account.

2. Find your unique ngrok url

3. Start the local application as usual.

4. Run the following command to start ngrok and route it to your local application.  Replace `YOUR_UNIQUE_NGROK_URL` with your url from step 2.

```
ngrok http --url=YOUR_UNIQUE_NGROK_URL http://localhost:3000
```
