<h1 align="center">
  Application Configuration Service
</h1>

<div align="center">
  Provide applications with configuration values in a performant way!
  <br />
  <br />
</div>

<div align="center">
<br />

[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg?style=flat-square)](https://github.com/eyevinn/{{repo-name}}/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![made with hearth by Eyevinn](https://img.shields.io/badge/made%20with%20%E2%99%A5%20by-Eyevinn-59cbe8.svg?style=flat-square)](https://github.com/eyevinn)
[![Slack](http://slack.streamingtech.se/badge.svg)](http://slack.streamingtech.se)

</div>

Backed with a Redis (or Redis compatible) key/value store this service lets you manage application configuration variables and serve them to the clients. Cache control headers provided by default and ready to be placed behind a CDN for delivery to many user applications at the same time.

## Requirements

Redis compatible database

## Installation / Usage

```
% npm install
```

### Using Key/Value Store in Open Source Cloud

Install OSC client if not already installed and make sure your env variable `OSC_ACCESS_TOKEN` is set to your personal access token in Open Source Cloud.

```
% export OSC_ACCESS_TOKEN=<pat>
```

Launch Valkey IO instance (Redis compatible key/value store)

```
% osc create valkey-io-valkey dev
```

Obtain the IP and port in the Open Source Cloud user interface and then start the service with

```
% REDIS_URL=redis://<ip>:<port> npm start
```

### Application Configuration Service API

Once service is up and running you have the Swagger docs at `http://localhost:8000/api/docs`

### Frontend

Configuration frontend is available at `http://localhost:8000/`

### Read configuration values

For an application to read configuration with key `foo`, example in Javascript:

```javascript
const response = await fetch('http://localhost:8000/api/v1/config/foo', {
  method: 'GET',
  headers: {
    Accept: 'text/plain'
  }
});
if (response.ok) {
  const value = await response.text();
  // value is a string
}
```

Example when application accepts JSON:

```javascript
const response = await fetch('http://localhost:8000/api/v1/config/foo', {
  method: 'GET',
  headers: {
    Accept: 'application/json'
  }
});
if (response.ok) {
  const { key, value } = await response.json();
}
```

## Development

### Local Redis as Docker

Run local instance of Redis using Docker

```
% docker run --rm --name my-redis -p 6379:6379 -d redis
```

Then start service

```
% REDIS_URL=redis://localhost:6379 npm start
```

Frontend in development mode on http://localhost:3000

```
% npm run dev:app
```

Build app

```
% npm run build:app
```

Output is placed in folder `out/` that is served by the API server.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## License

This project is licensed under the MIT License, see [LICENSE](LICENSE).

# Support

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

# About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward we develop proof-of-concepts and tools. The things we learn and the code we write we share with the industry in [blogs](https://dev.to/video) and by open sourcing the code we have written.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
