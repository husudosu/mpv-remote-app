## Info

Build production:

```bash
ionic capacitor build android --prod --release --verbose
```

Optimized build:

```bash
ionic capacitor build android --prod --aot --minifyjs --minifycss --optimizejs
```

Run debugging on android:

```bash
ionic capacitor run android -l --host=host
```

## TODO

- By some reasons routing not working properly, when not using modals on Settings -> Servers and Media collections
- Better handling for playlist
- Need some help with [cordova-plugin-music-controls2](https://github.com/Arzio/cordova-plugin-music-controls2) plugin:
  - When the app is not active, playback status not refreshing for notification,
  - I'd like remove album cover from notification.
