Sudoku Legend - Google Login Patch

Supabase dashboard > Authentication > URL Configuration > Redirect URLs
Add exactly: sudokulegend://auth/callback

Patch contains these 3 paths; overlay them in the Android project:
app/src/main/assets/index.html
app/src/main/java/com/sudokulegend/game/MainActivity.java
app/src/main/AndroidManifest.xml

IMPORTANT: Do not uninstall existing APK. Rebuild and install as update to retain local game progress.
Google sign-in opens external browser, returns via Android custom URI, and creates Supabase session. Existing email login and manual cloud upload/download remain.
Google accounts and previous email accounts may have different user IDs; do not overwrite before verifying backup.
