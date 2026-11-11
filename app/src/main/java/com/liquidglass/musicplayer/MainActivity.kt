package com.liquidglass.musicplayer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.liquidglass.musicplayer.core.design.LiquidGlassTheme
import com.liquidglass.musicplayer.feature.player.NowPlayingScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LiquidGlassTheme {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    var isPlaying by remember { mutableStateOf(false) }
                    var progress by remember { mutableFloatStateOf(0.35f) }
                    var isFavorite by remember { mutableStateOf(true) }
                    var isShuffle by remember { mutableStateOf(false) }
                    var repeatMode by remember { mutableStateOf("all") }

                    NowPlayingScreen(
                        title = "Starlight Horizon",
                        artist = "Solaris Wave",
                        album = "Celestial Resonance (2026)",
                        artworkUri = null,
                        isPlaying = isPlaying,
                        progress = progress,
                        durationText = "03:45",
                        currentTimeText = "01:18",
                        isFavorite = isFavorite,
                        isShuffle = isShuffle,
                        repeatMode = repeatMode,
                        onPlayPause = { isPlaying = !isPlaying },
                        onNext = { progress = 0f },
                        onPrevious = { progress = 0f },
                        onSeek = { progress = it },
                        onFavoriteToggle = { isFavorite = !isFavorite },
                        onShuffleToggle = { isShuffle = !isShuffle },
                        onRepeatToggle = {
                            repeatMode = when (repeatMode) {
                                "off" -> "all"
                                "all" -> "one"
                                else -> "off"
                            }
                        },
                        onOpenQueue = {},
                        onOpenEqualizer = {},
                        onClose = { finish() }
                    )
                }
            }
        }
    }
}
