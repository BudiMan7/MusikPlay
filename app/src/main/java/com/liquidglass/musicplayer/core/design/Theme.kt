package com.liquidglass.musicplayer.core.design

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

enum class ThemeMode {
    DARK,
    LIGHT,
    FOLLOW_SYSTEM
}

data class LiquidGlassColors(
    val background: Color,
    val surface: Color,
    val glassLayer: Color,
    val glassBorder: Color,
    val accent: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val isDark: Boolean
)

val LocalLiquidGlassColors = staticCompositionLocalOf {
    LiquidGlassColors(
        background = DarkBackground,
        surface = DarkSurface,
        glassLayer = DarkGlassLayer,
        glassBorder = DarkGlassBorder,
        accent = DarkAccent,
        textPrimary = DarkTextPrimary,
        textSecondary = DarkTextSecondary,
        isDark = true
    )
}

@Composable
fun LiquidGlassTheme(
    themeMode: ThemeMode = ThemeMode.FOLLOW_SYSTEM,
    customAccent: Color? = null,
    dynamicArtworkColor: Color? = null,
    content: @Composable () -> Unit
) {
    val systemInDark = isSystemInDarkTheme()
    val isDark = when (themeMode) {
        ThemeMode.DARK -> true
        ThemeMode.LIGHT -> false
        ThemeMode.FOLLOW_SYSTEM -> systemInDark
    }

    val activeAccent = dynamicArtworkColor ?: customAccent ?: if (isDark) DarkAccent else LightAccent

    val colors = if (isDark) {
        LiquidGlassColors(
            background = DarkBackground,
            surface = DarkSurface,
            glassLayer = DarkGlassLayer,
            glassBorder = DarkGlassBorder,
            accent = activeAccent,
            textPrimary = DarkTextPrimary,
            textSecondary = DarkTextSecondary,
            isDark = true
        )
    } else {
        LiquidGlassColors(
            background = LightBackground,
            surface = LightSurface,
            glassLayer = LightGlassLayer,
            glassBorder = LightGlassBorder,
            accent = activeAccent,
            textPrimary = LightTextPrimary,
            textSecondary = LightTextSecondary,
            isDark = false
        )
    }

    val materialColors = if (isDark) {
        darkColorScheme(
            primary = colors.accent,
            background = colors.background,
            surface = colors.surface,
            onPrimary = Color.Black,
            onBackground = colors.textPrimary,
            onSurface = colors.textPrimary
        )
    } else {
        lightColorScheme(
            primary = colors.accent,
            background = colors.background,
            surface = colors.surface,
            onPrimary = Color.White,
            onBackground = colors.textPrimary,
            onSurface = colors.textPrimary
        )
    }

    CompositionLocalProvider(LocalLiquidGlassColors provides colors) {
        MaterialTheme(
            colorScheme = materialColors,
            typography = GlassTypography,
            content = content
        )
    }
}
