package com.liquidglass.musicplayer.core.design

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

object GlassShapes {
    val LargeCard = RoundedCornerShape(26.dp)
    val MediumCard = RoundedCornerShape(20.dp)
    val SmallCard = RoundedCornerShape(14.dp)
    val Pill = CircleShape
    val MiniPlayer = RoundedCornerShape(24.dp)
    val BottomBar = RoundedCornerShape(32.dp)
    val BottomSheet = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
    val Dialog = RoundedCornerShape(24.dp)
}
