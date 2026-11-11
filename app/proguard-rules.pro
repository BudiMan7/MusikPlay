# Liquid Glass Music Player - Android Release ProGuard Rules

# Keep Media3 ExoPlayer classes & reflection
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# Keep Room Database DAOs and Entities
-keep class androidx.room.** { *; }
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }

# Keep Audio Effects & Visualizer
-keep class android.media.audiofx.** { *; }

# Keep Coil Image Loading
-keep class coil.** { *; }
-dontwarn coil.**

# Keep Kotlin Coroutines
-keepnames class kotlinx.coroutines.** { *; }

# Keep Liquid Glass App classes
-keep class com.liquidglass.musicplayer.data.local.database.** { *; }
-keep class com.liquidglass.musicplayer.playback.service.** { *; }
