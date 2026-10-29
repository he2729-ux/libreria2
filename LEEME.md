# Libris – app Android

Ya no necesita servidor: el chat con IA llama a Gemini directo desde el teléfono (clave en "Conectar cuenta").

## Obtener el APK
**Opción A (sin instalar nada):** sube esta carpeta a un repositorio de GitHub → pestaña *Actions* → *Build Android APK* → *Run workflow* → descarga `libris-debug-apk`.

**Opción B (en tu PC con Android Studio / JDK 21 + Android SDK):**
```
npm install
npm run android:apk      # genera android/app/build/outputs/apk/debug/app-debug.apk
```
o `npm run android:sync && npm run android:open` para abrir en Android Studio.

## Alternativa: PWA
`npm run build` y publica `dist/` en cualquier hosting HTTPS (Netlify, Vercel…); desde Chrome → "Instalar app".
