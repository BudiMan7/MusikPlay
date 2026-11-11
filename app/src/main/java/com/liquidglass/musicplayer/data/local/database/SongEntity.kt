package com.liquidglass.musicplayer.data.local.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "songs")
data class SongEntity(
    @PrimaryKey val id: Long,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Long, // milliseconds
    val contentUri: String,
    val artworkUri: String?,
    val genre: String?,
    val folderPath: String?,
    val isFavorite: Boolean = false,
    val playCount: Int = 0,
    val dateAdded: Long = System.currentTimeMillis()
)

@Entity(tableName = "playback_history")
data class PlaybackHistoryEntity(
    @PrimaryKey(autoGenerate = true) val historyId: Long = 0,
    val songId: Long,
    val playedAt: Long = System.currentTimeMillis()
)
