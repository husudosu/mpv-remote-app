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
