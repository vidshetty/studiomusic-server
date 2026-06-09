package mainrouter

import (
	dashboardrouter "server_go/routers/dashboard-router"

	"github.com/gin-gonic/gin"
)

func Register(router *gin.RouterGroup) {

	// dashboard apis
	dashboardrouter.Register(router.Group("/dashboard"))

	// main
	router.GET("/lyrics", getLyrics)
	router.GET("/hls/listen/:track_title/:file_name", hlsListen)

}
