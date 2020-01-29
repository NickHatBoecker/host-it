# Host-it!

> Host-it! is an electron-vue app to manage your virtualhosts easily on Mac OS.

**ATTENTION**: Do not use this on a production system. It's for develop purpose only.

<kbd>
    <img src="https://nick-hat-boecker.de/files/images/github/nhb_host_it_v1.0.0.jpg" alt="Screenshot of Host-it! v1.0.0" width="100%"/>
</kbd>

# Features

- Manage all your virtualhosts easily
- Add/Edit/Remove virtualhost
- Restart Apache with a click of a button
- Open virtualhost in default browser
- Open virtualhost error_log (or default error_log if no specific one was added)
- Deposit default `error_log` path

# How to use

- Create `vhosts` directory if necessary (I have mine under `/usr/local/etc/httpd/extra/vhosts/`)
- Include the directory in your httpd conf: ```Include extra/vhosts/*.conf```
- Restart apache: You can do this in the app or via `sudo apachectl -k restart`
- Then, in the application settings, set the path to the `vhosts` directory.

**ATTENTION**: Your `/etc/hosts` is not updated automatically. Update manually or use the great tool [Dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html). You can install it via Homebrew: `brew install dnsmasq`.

# More to come

- Edit virtualhost entry manually and add specific needs e.g. Directory Options
- Syntax Check for Apache Config
- Offer automatic httpd.conf setup with ```Include extra/vhosts/*.conf```
- Check if given document root exists (otherwhise offer to create it)

# Build Setup

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

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
