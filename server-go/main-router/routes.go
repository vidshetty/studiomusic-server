package mainrouter

import "github.com/gin-gonic/gin"

func Register(router *gin.RouterGroup) {

	router.GET("/lyrics", getLyrics)
	router.POST("/lyrics", uploadLyrics)

	router.GET("/hls/listen/:track_title/:file_name", hlsListen)
	router.POST("/track", uploadTrack)

}
