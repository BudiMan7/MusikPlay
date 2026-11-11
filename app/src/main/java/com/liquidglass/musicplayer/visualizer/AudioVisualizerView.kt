package com.liquidglass.musicplayer.visualizer

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import kotlin.math.cos
import kotlin.math.sin

enum class VisualizerType {
    SPECTRUM_BARS,
    WAVEFORM,
    CIRCULAR
}

@Composable
fun AudioVisualizerCanvas(
    fftData: ByteArray,
    visualizerType: VisualizerType,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(140.dp)
    ) {
        val width = size.width
        val height = size.height

        when (visualizerType) {
            VisualizerType.SPECTRUM_BARS -> {
                val barCount = 32
                val barWidth = (width / barCount) * 0.75f
                val gap = (width / barCount) * 0.25f

                for (i in 0 until barCount) {
                    val dataIndex = (i * (fftData.size / barCount)).coerceIn(0, fftData.size - 1)
                    val rawVal = (fftData[dataIndex].toInt() and 0xFF) / 255f
                    val barHeight = rawVal * height * 0.9f
                    val x = i * (barWidth + gap)
                    val y = height - barHeight

                    drawRect(
                        brush = Brush.verticalGradient(
                            colors = listOf(accentColor, accentColor.copy(alpha = 0.3f)),
                            startY = y,
                            endY = height
                        ),
                        topLeft = Offset(x, y),
                        size = Size(barWidth, barHeight)
                    )
                }
            }
            VisualizerType.WAVEFORM -> {
                val path = Path()
                val step = width / (fftData.size - 1).coerceAtLeast(1)

                fftData.forEachIndexed { index, byte ->
                    val normalized = (byte.toFloat() + 128f) / 255f
                    val y = normalized * height
                    val x = index * step
                    if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
                }

                drawPath(
                    path = path,
                    color = accentColor,
                    style = Stroke(width = 3.dp.toPx())
                )
            }
            VisualizerType.CIRCULAR -> {
                val centerX = width / 2
                val centerY = height / 2
                val baseRadius = height * 0.28f
                val points = 36

                for (i in 0 until points) {
                    val angle = (i.toFloat() / points) * (2 * Math.PI).toFloat()
                    val dataIndex = (i * (fftData.size / points)).coerceIn(0, fftData.size - 1)
                    val rawVal = (fftData[dataIndex].toInt() and 0xFF) / 255f
                    val spike = rawVal * 30.dp.toPx()

                    val startX = centerX + cos(angle) * baseRadius
                    val startY = centerY + sin(angle) * baseRadius
                    val endX = centerX + cos(angle) * (baseRadius + spike)
                    val endY = centerY + sin(angle) * (baseRadius + spike)

                    drawLine(
                        color = accentColor,
                        start = Offset(startX, startY),
                        end = Offset(endX, endY),
                        strokeWidth = 2.5.dp.toPx()
                    )
                }
            }
        }
    }
}
