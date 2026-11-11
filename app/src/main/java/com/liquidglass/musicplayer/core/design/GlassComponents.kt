package com.liquidglass.musicplayer.core.design

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * 1. GlassCard
 */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    shape: Shape = GlassShapes.LargeCard,
    elevation: Dp = 10.dp,
    content: @Composable BoxScope.() -> Unit
) {
    val colors = LocalLiquidGlassColors.current
    Box(
        modifier = modifier
            .shadow(elevation, shape, clip = false)
            .clip(shape)
            .background(colors.glassLayer)
            .border(BorderStroke(1.dp, colors.glassBorder), shape)
    ) {
        // Subtle top light reflection
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.White.copy(alpha = if (colors.isDark) 0.12f else 0.25f),
                            Color.Transparent
                        )
                    )
                )
        )
        content()
    }
}

/**
 * 2. GlassButton
 */
@Composable
fun GlassButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    isPrimary: Boolean = true
) {
    val colors = LocalLiquidGlassColors.current
    val bg = if (isPrimary) colors.accent else colors.glassLayer
    val textColor = if (isPrimary) {
        if (colors.isDark) Color.Black else Color.White
    } else {
        colors.textPrimary
    }

    Box(
        modifier = modifier
            .height(48.dp)
            .clip(GlassShapes.Pill)
            .background(bg)
            .border(BorderStroke(1.dp, if (isPrimary) Color.Transparent else colors.glassBorder), GlassShapes.Pill)
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = textColor,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = text,
                style = MaterialTheme.typography.bodyMedium,
                color = textColor
            )
        }
    }
}

/**
 * 3. GlassIconButton
 */
@Composable
fun GlassIconButton(
    icon: ImageVector,
    contentDescription: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    tint: Color? = null
) {
    val colors = LocalLiquidGlassColors.current
    val effectiveTint = tint ?: colors.textPrimary

    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(colors.glassLayer)
            .border(BorderStroke(1.dp, colors.glassBorder), CircleShape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = effectiveTint,
            modifier = Modifier.size(22.dp)
        )
    }
}

/**
 * 4. GlassBottomBar
 */
@Composable
fun GlassBottomBar(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit
) {
    val colors = LocalLiquidGlassColors.current
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(68.dp)
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clip(GlassShapes.BottomBar)
            .background(colors.glassLayer)
            .border(BorderStroke(1.dp, colors.glassBorder), GlassShapes.BottomBar)
            .padding(horizontal = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically,
            content = content
        )
    }
}

/**
 * 5. GlassMiniPlayer
 */
@Composable
fun GlassMiniPlayer(
    title: String,
    artist: String,
    isPlaying: Boolean,
    progress: Float,
    onPlayPause: () -> Unit,
    onNext: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalLiquidGlassColors.current
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp)
            .padding(horizontal = 12.dp)
            .shadow(12.dp, GlassShapes.MiniPlayer)
            .clip(GlassShapes.MiniPlayer)
            .background(colors.surface.copy(alpha = if (colors.isDark) 0.85f else 0.90f))
            .border(BorderStroke(1.dp, colors.glassBorder), GlassShapes.MiniPlayer)
            .clickable(onClick = onClick)
    ) {
        // Mini progress bar at top of capsule
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(2.dp),
            color = colors.accent,
            trackColor = Color.Transparent
        )
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(colors.accent.copy(alpha = 0.3f))
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.textPrimary,
                    maxLines = 1
                )
                Text(
                    text = artist,
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.textSecondary,
                    maxLines = 1
                )
            }
            GlassIconButton(
                icon = if (isPlaying) Icons.Default.PlayArrow else Icons.Default.PlayArrow,
                contentDescription = if (isPlaying) "Pause" else "Play",
                onClick = onPlayPause,
                size = 38.dp
            )
            Spacer(modifier = Modifier.width(8.dp))
            GlassIconButton(
                icon = Icons.Default.SkipNext,
                contentDescription = "Next Track",
                onClick = onNext,
                size = 38.dp
            )
        }
    }
}

/**
 * 6. GlassSlider
 */
@Composable
fun GlassSlider(
    value: Float,
    onValueChange: (Float) -> Unit,
    modifier: Modifier = Modifier,
    valueRange: ClosedFloatingPointRange<Float> = 0f..1f
) {
    val colors = LocalLiquidGlassColors.current
    Slider(
        value = value,
        onValueChange = onValueChange,
        valueRange = valueRange,
        modifier = modifier,
        colors = SliderDefaults.colors(
            thumbColor = colors.accent,
            activeTrackColor = colors.accent,
            inactiveTrackColor = colors.glassBorder
        )
    )
}

/**
 * 7. GlassToggle
 */
@Composable
fun GlassToggle(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalLiquidGlassColors.current
    Switch(
        checked = checked,
        onCheckedChange = onCheckedChange,
        modifier = modifier,
        colors = SwitchDefaults.colors(
            checkedThumbColor = colors.accent,
            checkedTrackColor = colors.accent.copy(alpha = 0.4f),
            uncheckedThumbColor = colors.textSecondary,
            uncheckedTrackColor = colors.glassLayer
        )
    )
}

/**
 * 8. GlassPresetCard
 */
@Composable
fun GlassPresetCard(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalLiquidGlassColors.current
    val borderCol = if (isSelected) colors.accent else colors.glassBorder
    val bgCol = if (isSelected) colors.accent.copy(alpha = 0.2f) else colors.glassLayer

    Box(
        modifier = modifier
            .clip(GlassShapes.SmallCard)
            .background(bgCol)
            .border(BorderStroke(if (isSelected) 1.5.dp else 1.dp, borderCol), GlassShapes.SmallCard)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.bodyMedium,
            color = if (isSelected) colors.accent else colors.textPrimary
        )
    }
}
