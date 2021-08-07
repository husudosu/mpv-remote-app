- Improve launch time speed
- Create "branding" for app like logo, app info etc...
- Basic error rendering
- Create an installer for plugin, maybe by using NSIS (Windows) and simple bash script for Linux
- It's not good idea to store Socket.IO connection on Vuex store. See these threads: https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143/2
  Not recommended to store Axios instance on store: https://forum.vuejs.org/t/accessing-axios-in-vuex-module/29414
- Need better tutorial

## Info

Build production:

```bash
ionic capacitor build android --prod --release --verbose
```

Run debugging on android:

```bash
ionic capacitor run android -l --host=host
```
