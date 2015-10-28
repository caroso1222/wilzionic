cordova build --release android
cd platforms/android/build/outputs/apk
rm wilz.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore join-key.keystore android-release-unsigned.apk join_key
zipalign -v 4 android-release-unsigned.apk wilz.apk