# Deploy-it!

> Host-it! is an electron-vue app to manage your virtualhosts easily on Mac OS.

**ATTENTION**: Do not use this on a production system. It's for develop purpose only.

<kbd>
    <img src="https://nick-hat-boecker.de/files/images/github/nhb_host_it_v1.0.0.jpg" alt="Screenshot of Host-it! v1.0.0" width="100%"/>
</kbd>

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# lint all JS/Vue component files in `src/`
npm run lint

```

#### Preconfiguration

- Add the following line to your httpd conf: ```Include extra/vhosts/*.conf```
- create `vhosts` directory if necessary
- Restart apache: You can do this in the app or via `sudo apachectl restart`
- Then, in the application settings, save the path to the `vhosts` directory.

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
