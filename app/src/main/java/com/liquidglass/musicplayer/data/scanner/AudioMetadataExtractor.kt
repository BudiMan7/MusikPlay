package com.liquidglass.musicplayer.data.scanner

import android.content.Context
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

data class ExtractedAudioMetadata(
    val title: String?,
    val artist: String?,
    val album: String?,
    val genre: String?,
    val year: String?,
    val durationMs: Long,
    val embeddedPicture: ByteArray?,
    val lyrics: String?
)

class AudioMetadataExtractor(private val context: Context) {

    suspend fun extractMetadata(contentUri: Uri, filePath: String?): ExtractedAudioMetadata =
        withContext(Dispatchers.IO) {
            val retriever = MediaMetadataRetriever()
            var title: String? = null
            var artist: String? = null
            var album: String? = null
            var genre: String? = null
            var year: String? = null
            var durationMs: Long = 0
            var embeddedPic: ByteArray? = null
            var lyrics: String? = null

            try {
                retriever.setDataSource(context, contentUri)
                title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE)
                artist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST)
                album = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM)
                genre = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE)
                year = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_YEAR)
                    ?: retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DATE)

                val durStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
                durationMs = durStr?.toLongOrNull() ?: 0

                // Embedded Album Artwork extraction
                embeddedPic = retriever.embeddedPicture

                // Embedded Lyrics extraction (Supported on Android API 28+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    lyrics = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_LYRIC)
                }

                // If embedded lyrics not found in tags, look for companion .lrc file
                if (lyrics.isNullOrBlank() && filePath != null) {
                    val audioFile = File(filePath)
                    val baseName = audioFile.nameWithoutExtension
                    val lrcFile = File(audioFile.parentFile, "$baseName.lrc")
                    if (lrcFile.exists() && lrcFile.canRead()) {
                        lyrics = lrcFile.readText()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                try {
                    retriever.release()
                } catch (_: Exception) {}
            }

            ExtractedAudioMetadata(
                title = title,
                artist = artist,
                album = album,
                genre = genre,
                year = year,
                durationMs = durationMs,
                embeddedPicture = embeddedPic,
                lyrics = lyrics
            )
        }
}
