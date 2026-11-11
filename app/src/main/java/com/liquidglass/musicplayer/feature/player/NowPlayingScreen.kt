package com.liquidglass.musicplayer.feature.player

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import com.liquidglass.musicplayer.core.design.*

@Composable
fun NowPlayingScreen(
    title: String,
    artist: String,
    album: String,
    artworkUri: String?,
    isPlaying: Boolean,
    progress: Float,
    durationText: String,
    currentTimeText: String,
    isFavorite: Boolean,
    isShuffle: Boolean,
    repeatMode: String,
    onPlayPause: () -> Unit,
    onNext: () -> Unit,
    onPrevious: () -> Unit,
    onSeek: (Float) -> Unit,
    onFavoriteToggle: () -> Unit,
    onShuffleToggle: () -> Unit,
    onRepeatToggle: () -> Unit,
    onOpenQueue: () -> Unit,
    onOpenEqualizer: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalLiquidGlassColors.current

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        // Dynamic Ambient Blurred Backdrop
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            colors.accent.copy(alpha = 0.35f),
                            Color.Transparent
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                GlassIconButton(
                    icon = Icons.Default.KeyboardArrowDown,
                    contentDescription = "Minimize Player",
                    onClick = onClose
                )
                Text(
                    text = "NOW PLAYING",
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.textSecondary
                )
                GlassIconButton(
                    icon = Icons.Default.QueueMusic,
                    contentDescription = "Queue",
                    onClick = onOpenQueue
                )
            }

            // Center: Large Album Artwork with Liquid Glass Frame
            GlassCard(
                modifier = Modifier
                    .size(310.dp)
                    .padding(8.dp),
                shape = GlassShapes.LargeCard
            ) {
                if (artworkUri != null) {
                    Image(
                        painter = rememberAsyncImagePainter(model = artworkUri),
                        contentDescription = title,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(GlassShapes.LargeCard),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(colors.glassLayer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.MusicNote,
                            contentDescription = null,
                            tint = colors.accent,
                            modifier = Modifier.size(80.dp)
                        )
                    }
                }
            }

            // Track Information
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleLarge,
                        color = colors.textPrimary,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$artist • $album",
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.textSecondary,
                        maxLines = 1
                    )
                }
                GlassIconButton(
                    icon = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    contentDescription = "Favorite",
                    onClick = onFavoriteToggle,
                    tint = if (isFavorite) Color(0xFFFF4D6D) else colors.textSecondary
                )
            }

            // Timeline Scrubber
            Column(modifier = Modifier.fillMaxWidth()) {
                GlassSlider(
                    value = progress,
                    onValueChange = onSeek,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = currentTimeText,
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.textSecondary
                    )
                    Text(
                        text = durationText,
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.textSecondary
                    )
                }
            }

            // Playback Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                GlassIconButton(
                    icon = Icons.Default.Shuffle,
                    contentDescription = "Shuffle",
                    onClick = onShuffleToggle,
                    tint = if (isShuffle) colors.accent else colors.textSecondary
                )
                GlassIconButton(
                    icon = Icons.Default.SkipPrevious,
                    contentDescription = "Previous",
                    onClick = onPrevious,
                    size = 52.dp
                )
                // Primary Play/Pause Button
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .shadow(16.dp, CircleShape)
                        .clip(CircleShape)
                        .background(colors.accent),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(onClick = onPlayPause) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isPlaying) "Pause" else "Play",
                            tint = if (colors.isDark) Color.Black else Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }
                GlassIconButton(
                    icon = Icons.Default.SkipNext,
                    contentDescription = "Next",
                    onClick = onNext,
                    size = 52.dp
                )
                GlassIconButton(
                    icon = Icons.Default.Repeat,
                    contentDescription = "Repeat",
                    onClick = onRepeatToggle,
                    tint = if (repeatMode != "off") colors.accent else colors.textSecondary
                )
            }

            // Bottom Shortcuts (Equalizer & Lyrics)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                GlassButton(
                    text = "Equalizer",
                    icon = Icons.Default.Equalizer,
                    onClick = onOpenEqualizer,
                    isPrimary = false,
                    modifier = Modifier.weight(1f).padding(end = 8.dp)
                )
                GlassButton(
                    text = "Lyrics",
                    icon = Icons.Default.Notes,
                    onClick = { /* Open Lyrics */ },
                    isPrimary = false,
                    modifier = Modifier.weight(1f).padding(start = 8.dp)
                )
            }
        }
    }
}
